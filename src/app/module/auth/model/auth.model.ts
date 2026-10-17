import { Role } from '../../../shared/enums/role.enum';

export interface SessionUser {
  id: number;
  username: string;
  rol: Role;
}

export interface LoginResult {
  token: string;
  type: string;
  user: SessionUser;
}

export interface ProfileUpdateRequest {
  nombres: string;
  apellidos: string;
  username: string;
  email: string | null;
  telefono: string | null;
  nuevaClave: string | null;
}

export interface ProfileResponse {
  nombres: string;
  apellidos: string;
  username: string;
  email: string | null;
  telefono: string | null;
  rol: Role;
}
