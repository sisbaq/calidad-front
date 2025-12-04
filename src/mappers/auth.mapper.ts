import type { User } from '@/types/auth';

/**
 * Maps a user object from the API format (Spanish) to the frontend format (English).
 * @param apiUser - The raw user object from the API.
 * @returns A user object that conforms to the frontend's `User` interface.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mapApiUserToFrontend = (apiUser: any): User => {
  return {
    id: apiUser.id || apiUser.idUsuario,
    fullName: apiUser.fullName || apiUser.nombreCompleto,
    username: apiUser.username || apiUser.nombreUsuario,
    email: apiUser.email || apiUser.usuEmailContacto,
    department: apiUser.department || apiUser.dependencia, 
    position: apiUser.position || apiUser.cargo, 
    role: apiUser.role || apiUser.rol,
  };
};
