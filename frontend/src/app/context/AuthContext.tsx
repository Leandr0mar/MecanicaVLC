import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  id: string;
  idUsuario?: string;
  nombre: string;
  apellido?: string;
  dni?: string;
  tipoDocumento?: 'DNI' | 'CE';
  numeroDocumento?: string;
  email: string;
  rol: 'cliente' | 'trabajador' | 'admin';
  telefono?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<boolean>;
  isAuthenticated: boolean;
}

interface RegisterData {
  nombre: string;
  apellido: string;
  tipoDocumento: 'DNI' | 'CE';
  numeroDocumento: string;
  email: string;
  password: string;
  telefono: string;
  direccion: string;
  placaMototaxi: string;
  marcaMototaxi: string;
  modeloMototaxi: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children?: ReactNode;
}

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

// 🌟 AQUÍ ESTÁ EL CAMBIO: Se añadió "export" al inicio
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('vlc_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (!user) return;

    let heartbeatEnCurso = false;
    const enviarHeartbeat = async () => {
      if (heartbeatEnCurso) return;
      heartbeatEnCurso = true;
      try {
        const response = await fetch(`${API_URL}/api/auth/heartbeat`, {
          method: 'POST',
          credentials: 'include',
        });
        if (response.status === 401) {
          localStorage.removeItem('vlc_user');
          setUser(null);
        }
      } catch (error) {
        console.error('Presence heartbeat error:', error);
      } finally {
        heartbeatEnCurso = false;
      }
    };

    const alCambiarVisibilidad = () => {
      if (document.visibilityState === 'visible') void enviarHeartbeat();
    };

    void enviarHeartbeat();
    const intervalo = window.setInterval(() => void enviarHeartbeat(), 20_000);
    document.addEventListener('visibilitychange', alCambiarVisibilidad);

    return () => {
      window.clearInterval(intervalo);
      document.removeEventListener('visibilitychange', alCambiarVisibilidad);
    };
  }, [user]);

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error || 'Credenciales incorrectas');
      }

      const userData = await response.json();
      userData.idUsuario = userData.idUsuario ?? userData.id;
      userData.id = userData.id ?? userData.idUsuario;
      setUser(userData);
      localStorage.setItem('vlc_user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error instanceof Error ? error : new Error('No se pudo conectar con el servidor');
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/registrar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error || `No se pudo completar el registro (HTTP ${response.status})`);
      }
      return true;
    } catch (error) {
      console.error('Register error:', error);
      throw error instanceof Error ? error : new Error('No se pudo conectar con el servidor');
    }
  };

  const logout = async (): Promise<boolean> => {
    let confirmadoPorServidor = false;
    try {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      confirmadoPorServidor = response.ok;
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('vlc_user');
    }
    return confirmadoPorServidor;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
