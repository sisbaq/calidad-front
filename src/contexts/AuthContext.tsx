import { createContext } from 'react';
import type { Session } from '../types/auth';

export interface AuthContextType {
  session: Session | null;
  loading: boolean;
  login: (credentials: { usuario: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
