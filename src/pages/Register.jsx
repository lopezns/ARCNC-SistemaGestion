import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    termsAccepted: false
  });

  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    number: false,
    upperCase: false,
    specialChar: false
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    if (name === 'password') {
      setPasswordRequirements({
        length: value.length >= 8,
        number: /\d/.test(value),
        upperCase: /[A-Z]/.test(value),
        specialChar: /[!@#$/%^&*(),.?":{}|<>]/.test(value)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!passwordRequirements.length || !passwordRequirements.number || !passwordRequirements.upperCase || !passwordRequirements.specialChar) {
      setErrorMessage('La contraseña no cumple con los requisitos.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    if (!formData.termsAccepted) {
      setErrorMessage('Debes aceptar las políticas de seguridad.');
      return;
    }

    const userTypeID = formData.role === 'teacher' ? 2 : 3;

    try {
      const url = `https://simuladortornoyfresadoracnc.somee.com/api/User_?First_Name=${encodeURIComponent(formData.firstName)}&Last_Name=${encodeURIComponent(formData.lastName)}&Email=${encodeURIComponent(formData.email)}&Password=${encodeURIComponent(formData.password)}&User_Type_ID=${userTypeID}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Accept': 'text/plain' }
      });

      if (response.ok) {
        navigate('/login');
      } else {
        const errorData = await response.text();
        setErrorMessage(`Error en el registro: ${errorData}`);
      }
    } catch (error) {
      setErrorMessage('Error inesperado. Intenta nuevamente.');
    }
  };

  return (
   
   <div className="register-container">
    <div style={{ height: '5px' }}></div>
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

      <div className="register-box">
        <h2>Registro</h2>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre</label>
            <input type="text" name="firstName" placeholder="Nombre" value={formData.firstName} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Apellido</label>
            <input type="text" name="lastName" placeholder="Apellido" value={formData.lastName} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Correo Electrónico</label>
            <input type="email" name="email" placeholder="Correo Electrónico" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Confirmar Contraseña</label>
            <input type="password" name="confirmPassword" placeholder="Confirmar Contraseña" value={formData.confirmPassword} onChange={handleChange} required />
          </div>
        

          <div className="password-requirements">
            <ul>
              <li style={{ textDecoration: passwordRequirements.length ? 'line-through' : 'none' }}>Mínimo 8 caracteres</li>
              <li style={{ textDecoration: passwordRequirements.number ? 'line-through' : 'none' }}>Un número</li>
              <li style={{ textDecoration: passwordRequirements.upperCase ? 'line-through' : 'none' }}>Una mayúscula</li>
              <li style={{ textDecoration: passwordRequirements.specialChar ? 'line-through' : 'none' }}>Un carácter especial</li>
            </ul>
          </div>
          <div style={{ height: '5px' }}></div>
          <div className="form-group">
            <label>Rol</label>
            <select name="role" placeholder="Rol" value={formData.role} onChange={handleChange}>
              <option value="student">Estudiante</option>
            </select>
          </div>
          
          <div className="policy-group">
            <label className="checkbox-container">
              <input type="checkbox" name="termsAccepted" checked={formData.termsAccepted} onChange={handleChange} />
              Acepto las políticas
            </label>
            <button type="button" className="link-button" onClick={() => setShowPopup(true)}>Ver Políticas</button>
          </div>

          <button type="submit" className="sign-in-btn">Registrar</button>

          <div className="login-link">
            <button className="link-button" onClick={() => navigate('/login')}>Iniciar Sesión</button>
          </div>
        </form>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>Política de Tratamiento de Datos</h2>
            <p>El proyecto recopila únicamente datos personales necesarios (identificación, académicos/técnicos y técnicos automáticos) bajo consentimiento explícito o base legal, garantizando su confidencialidad, integridad y disponibilidad mediante cifrado (TLS/AES-256), control de acceso con MFA, respaldos seguros y medidas físicas alineadas a ISO 27001:2022; los datos se usan exclusivamente para fines formativos y de mejora del simulador, sin transferencias internacionales no autorizadas, conservándose solo durante la relación activa, y los titulares pueden ejercer derechos ARCO (acceso, rectificación, cancelación, oposición) o revocar consentimiento mediante solicitud a nlopezs@ucundinamarca.edu.co y lmarianapinzon@ucundinamarca.edu.co, comprometiéndonos a notificar brechas en menor de 72 horas y auditar anualmente el sistema.</p>
            <button className="close-popup" onClick={() => setShowPopup(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;
