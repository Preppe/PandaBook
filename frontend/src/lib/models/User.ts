export interface User {
  id: string;
  email: string | null;
  firstName?: string | null;
  lastName?: string | null;
  provider?: string;
  socialId?: string | null;
  role?: Role | null;
  status?: Status | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

// You may define Role and Status interfaces here or import them if available.
export interface Role {
  id: string;
  name: string;
  // Add other fields as needed based on backend Role entity
}

export interface Status {
  id: string;
  name: string;
  // Add other fields as needed based on backend Status entity
}