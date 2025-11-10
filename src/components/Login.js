import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, User, Lock, AlertCircle } from 'lucide-react';
import ApiService from '../services/ApiService';
import '../styles/Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await ApiService.login(credentials);
      
      if (response.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/dashboard');
      } else {
        setError(response.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      setError(error.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <LogIn size={32} />
          </div>
          <h1>Iniciar Sesión</h1>
          <p>Accede a tu cuenta para continuar</p>
        </div>
        
        {error && (
          <div className="error-message">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <div className="input-group">
              <User className="input-icon" size={20} />
              <input
                id="email"
                name="email"
                type="email"
                required
                value={credentials.email}
                onChange={handleChange}
                placeholder="tu@email.com"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-group">
              <Lock className="input-icon" size={20} />
              <input
                id="password"
                name="password"
                type="password"
                required
                value={credentials.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="login-button"
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>Sistema de Gestión Académica</p>
        </div>
      </div>
    </div>
  );
};

export default Login;