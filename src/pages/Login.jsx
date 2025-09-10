import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const loginResponse = await axios.post(
        'https://simuladortornoyfresadoracnc.somee.com/api/User_/login',
        null,
        {
          params: {
            Email: email,
            Password: password,
          },
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (loginResponse.data.message === 'Login successful') {
        const userResponse = await axios.get('https://simuladortornoyfresadoracnc.somee.com/api/User_', {
          headers: { accept: 'text/plain' },
        });

        const users = userResponse.data;
        const user = users.find((u) => u.email === email);

        if (user) {
          const userTypeId = user.user_Type.user_Type_ID;

          localStorage.setItem('userEmail', email);
          onLogin?.(email);

          switch (userTypeId) {
            case 3:
              navigate('/student');
              break;
            case 2:
              navigate('/teacher');
              break;
            case 1:
              navigate('/admin');
              break;
            default:
              setErrorMessage('Rol de usuario no reconocido.');
              setIsLoading(false);
          }
        } else {
          setErrorMessage('Usuario no encontrado.');
          setIsLoading(false);
        }
      } else {
        setErrorMessage('Correo o contraseña incorrectos.');
        setIsLoading(false);
      }
    } catch (error) {
      setErrorMessage('Error al verificar credenciales. Inténtalo más tarde.');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div style={{ flexGrow: 1 }}></div> {/* Espaciador arriba */}

      <div className="logo-container" onClick={() => navigate('/')}>
        <div className="loader-container">
          <div className="cube">
            <div className="face front"></div>
            <div className="face back"></div>
            <div className="face right"></div>
            <div className="face left"></div>
            <div className="face top"></div>
            <div className="face bottom"></div>
          </div>
        </div>
        <h1 className="logo-text">AR CNC</h1>
      </div>

      <div className="login-box">
        <h2>Login</h2>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {isLoading && <p className="loading-message">Cargando...</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo electrónico"
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
            />
          </div>

          <button type="submit" className="sign-in-btn" disabled={isLoading}>
            {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>

          <div className="create-account">
            <button className="link-button" onClick={() => navigate('/register')}>
              Crear Cuenta
            </button>
          </div>
        </form>
      </div>

      <div style={{ flexGrow: 2 }}></div> {/* Espaciador abajo */}
    </div>
  );
}

export default Login;
