import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Get user from session storage on initialization
  const userFromStorage = sessionStorage.getItem('user');
  const [user, setUser] = useState(
    userFromStorage ? JSON.parse(userFromStorage) : null
  );

  // Derived state: user exists = logged in
  const isLoggedIn = !!user;

  const signUp = async (email, password) => {
    try {
      const headers = { headers: { 'Content-Type': 'application/json' } };
      await axios.post(
        `${import.meta.env.VITE_API_URL}/users/signup`,
        JSON.stringify({ user: { email, password } }),
        headers
      );
      // Don't set user on signup, user needs to sign in
      setUser(null);
    } catch (error) {
      throw error; // Re-throw so SignUp component can handle it
    }
  };

  const signIn = async (email, password) => {
    try {
      const headers = { headers: { 'Content-Type': 'application/json' } };
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/signin`,
        JSON.stringify({ user: { email, password } }),
        headers
      );

      setUser(response.data);
      sessionStorage.setItem('user', JSON.stringify(response.data));
      sessionStorage.setItem('token', response.data.token);
    } catch (error) {
      throw error; 
    }
  };

  const signOut = () => {
    sessionStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    isLoggedIn,
    signUp,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
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
