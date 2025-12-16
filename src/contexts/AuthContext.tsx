import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, Expert, Buyer } from '@/types';
import { mockExperts, mockBuyers } from '@/data/mockData';

interface AuthContextType {
  user: User | Expert | Buyer | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | Expert | Buyer | null>(null);

  const login = async (email: string, password: string, role: UserRole) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (role === 'expert') {
      const expert = mockExperts.find(e => e.email === email) || mockExperts[0];
      setUser(expert);
    } else if (role === 'buyer') {
      const buyer = mockBuyers.find(b => b.email === email) || mockBuyers[0];
      setUser(buyer);
    } else {
      setUser({
        id: 'admin-1',
        email: 'admin@deeptech.com',
        name: 'Admin User',
        role: 'admin',
        profileVisible: true,
        createdAt: new Date(),
      });
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      name,
      role,
      profileVisible: true,
      createdAt: new Date(),
    };
    
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      register, 
      logout,
      updateProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
