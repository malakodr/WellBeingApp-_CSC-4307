import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setToken, removeToken } from '../lib/api';

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const { user, token } = await api.login({ email, password });
      setToken(token);
      navigate('/dashboard');
      return user;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    removeToken();
    navigate('/login');
  };

  return { login, logout, loading, error };
};
