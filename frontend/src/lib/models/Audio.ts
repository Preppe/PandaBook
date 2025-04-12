export interface Audio {
  id: string;
  bitrate: number;
  codec: string;
  duration: number;
  format: string;
  frequency: number;
  channels: number;
  size?: number;   // Excluded from plain output, optional
  s3Key?: string;  // Excluded from plain output, optional
}