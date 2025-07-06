// dashboard/lib/api.ts

export type ApiMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface ApiOptions {
  method?: ApiMethod;
  data?: any;
  headers?: Record<string, string>;
  token?: string;
  signal?: AbortSignal;
  onUploadProgress?: (progressEvent: ProgressEvent) => void; // Solo per compatibilità, fetch non supporta nativamente
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api/v1";

function buildUrl(endpoint: string) {
  if (/^https?:\/\//.test(endpoint)) return endpoint;
  return `${BASE_URL}${endpoint}`;
}

// PATCH libro + capitoli (multipart/form-data)
export async function updateBook(
  id: string,
  data: {
    title: string;
    author: string;
    description?: string;
    cover?: File | null;
    chapters: {
      id?: number;
      chapterNumber: number;
      description: string;
      startTime: number;
      endTime: number;
    }[];
  },
  token?: string
) {
  const form = new FormData();
  form.append("title", data.title);
  form.append("author", data.author);
  if (data.description) form.append("description", data.description);
  if (data.cover) form.append("cover", data.cover);

  form.append(
    "chapters",
    JSON.stringify(
      data.chapters.map((c) => ({
        id: c.id,
        chapterNumber: c.chapterNumber,
        description: c.description,
        startTime: c.startTime,
        endTime: c.endTime,
      }))
    )
  );

  const res = await fetch(buildUrl(`/books/${id}`), {
    method: "PATCH",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  });

  if (!res.ok) {
    let errorText = "";
    try {
      errorText = await res.text();
    } catch {}
    throw new Error(
      `API error: ${res.status} ${res.statusText}${errorText ? " - " + errorText : ""}`
    );
  }
  return res.json();
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const {
    method = "GET",
    data,
    headers = {},
    token,
    signal,
    onUploadProgress, // fetch non supporta nativamente, ignorato
  } = options;

  const mergedHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let body: BodyInit | undefined = undefined;
  if (data instanceof FormData) {
    // Lascia che il browser imposti il Content-Type per FormData
    delete mergedHeaders["Content-Type"];
    body = data;
  } else if (data !== undefined) {
    body = JSON.stringify(data);
  }

  const res = await fetch(buildUrl(endpoint), {
    method,
    headers: mergedHeaders,
    body: method === "GET" ? undefined : body,
    signal,
  });

  if (!res.ok) {
    let errorText = "";
    try {
      errorText = await res.text();
    } catch {}
    throw new Error(
      `API error: ${res.status} ${res.statusText}${errorText ? " - " + errorText : ""}`
    );
  }

  // Gestione risposta vuota
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }
  // @ts-ignore
  return res.text();
}

/**
 * GET (fetch, supporta sia client che server, opzioni avanzate)
 */
export async function get<T>(
  endpoint: string,
  options?: ApiOptions & { cache?: RequestCache }
): Promise<T> {
  const {
    headers = {},
    token,
    cache,
    signal,
    ...rest
  } = options || {};

  const mergedHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const url = buildUrl(endpoint);
  const res = await fetch(url, {
    method: "GET",
    headers: mergedHeaders,
    cache: cache ?? "force-cache",
    signal,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export function post<T>(endpoint: string, data?: any, options?: ApiOptions) {
  return apiRequest<T>(endpoint, { ...options, method: "POST", data });
}


export function put<T>(endpoint: string, data?: any, options?: ApiOptions) {
  return apiRequest<T>(endpoint, { ...options, method: "PUT", data });
}

export function del<T>(endpoint: string, options?: ApiOptions) {
  return apiRequest<T>(endpoint, { ...options, method: "DELETE" });
}

// Specialized upload function with chunked upload support
export interface UploadOptions {
  onProgress?: (progress: number) => void;
  onSpeedUpdate?: (speed: number) => void;
  onTimeRemaining?: (timeRemaining: number) => void;
  chunkSize?: number;
  token?: string;
  signal?: AbortSignal;
}

export interface ChunkUploadResponse {
  chunkId: string;
  uploaded: boolean;
}

export async function uploadFileWithProgress<T>(
  endpoint: string,
  formData: FormData,
  options: UploadOptions = {}
): Promise<T> {
  const {
    onProgress,
    onSpeedUpdate,
    onTimeRemaining,
    chunkSize = 5 * 1024 * 1024, // 5MB chunks
    token,
    signal,
  } = options;

  let startTime = Date.now();
  let uploadedBytes = 0;

  // Get the largest file to determine if we need chunked upload
  const files: File[] = [];
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      files.push(value);
    }
  }

  const largestFile = files.reduce((largest, file) =>
    file.size > largest.size ? file : largest, files[0] || { size: 0 }
  );

  // If largest file is smaller than chunk size, use regular upload
  if (!largestFile || largestFile.size <= chunkSize) {
    // fetch non supporta onUploadProgress nativamente
    return apiRequest<T>(endpoint, {
      method: "POST",
      data: formData,
      headers: {
        // fetch gestisce Content-Type per FormData
      },
      token,
      signal,
    });
  }

  // Use chunked upload for large files
  return uploadLargeFileInChunks<T>(endpoint, formData, largestFile, {
    ...options,
    chunkSize,
  });
}

async function uploadLargeFileInChunks<T>(
  endpoint: string,
  formData: FormData,
  largestFile: File,
  options: UploadOptions & { chunkSize: number }
): Promise<T> {
  const { chunkSize, onProgress, onSpeedUpdate, onTimeRemaining, token, signal } = options;

  const totalSize = largestFile.size;
  const totalChunks = Math.ceil(totalSize / chunkSize);
  let uploadedBytes = 0;
  const startTime = Date.now();

  // Generate upload session ID
  const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    // Upload chunks sequentially
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      if (signal?.aborted) {
        throw new Error('Upload cancelled');
      }

      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, totalSize);
      const chunk = largestFile.slice(start, end);

      const chunkFormData = new FormData();

      // Add metadata for first chunk
      if (chunkIndex === 0) {
        for (const [key, value] of formData.entries()) {
          if (!(value instanceof File) || value !== largestFile) {
            chunkFormData.append(key, value);
          }
        }
      }

      // Add chunk data
      chunkFormData.append('chunk', chunk);
      chunkFormData.append('chunkIndex', chunkIndex.toString());
      chunkFormData.append('totalChunks', totalChunks.toString());
      chunkFormData.append('uploadId', uploadId);
      chunkFormData.append('originalFilename', largestFile.name);

      // Upload chunk
      await apiRequest<ChunkUploadResponse>(`${endpoint}/chunk`, {
        method: "POST",
        data: chunkFormData,
        headers: {
          // fetch gestisce Content-Type per FormData
        },
        token,
        signal,
      });

      uploadedBytes += chunk.size;

      // Aggiorna progress
      if (onProgress) {
        const overallProgress = Math.round((uploadedBytes * 100) / totalSize);
        onProgress(overallProgress);
      }

      // Calcola velocità e tempo rimanente
      const elapsedTime = Date.now() - startTime;
      const speed = uploadedBytes / (elapsedTime / 1000);
      if (onSpeedUpdate) {
        onSpeedUpdate(speed);
      }
      if (onTimeRemaining && speed > 0) {
        const remainingBytes = totalSize - uploadedBytes;
        const timeRemaining = remainingBytes / speed;
        onTimeRemaining(timeRemaining);
      }
    }

    // Finalize upload
    return apiRequest<T>(`${endpoint}/finalize`, {
      method: "POST",
      data: { uploadId },
      token,
      signal,
    });

  } catch (error) {
    // Cleanup failed upload (unless it was cancelled)
    if (!signal?.aborted) {
      try {
        await apiRequest(`${endpoint}/cleanup`, {
          method: "DELETE",
          data: { uploadId },
          token,
          signal,
        });
      } catch (cleanupError) {
        // eslint-disable-next-line no-console
        console.warn('Failed to cleanup incomplete upload:', cleanupError);
      }
    }
    throw error;
  }
}
