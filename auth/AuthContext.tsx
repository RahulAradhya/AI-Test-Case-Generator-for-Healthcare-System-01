import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User, Role } from '../types';

// Hardcoded user data for simulation
const users: Record<string, { password: string; user: User }> = {
  'admin': { password: 'admin123', user: { id: '1', username: 'admin', role: Role.Admin } },
  'tester': { password: 'tester123', user: { id: '2', username: 'tester', role: Role.Tester } },
  'auditor': { password: 'auditor123', user: { id: '3', username: 'auditor', role: Role.ComplianceAuditor } },
};

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Check session storage for a logged-in user to persist session
    const savedUser = sessionStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (username: string, password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => { // Simulate network delay
        const userData = users[username.toLowerCase()];
        if (userData && userData.password === password) {
          sessionStorage.setItem('user', JSON.stringify(userData.user));
          setUser(userData.user);
          resolve();
        } else {
          reject(new Error('Invalid username or password'));
        }
      }, 500);
    });
  };

  const logout = () => {
    sessionStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
