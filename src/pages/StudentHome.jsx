import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './StudentHome.css';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { FaHome, FaCogs, FaSignOutAlt, FaChartLine, FaTrophy, FaSearch, FaCode, FaPlay, FaDownload, FaGamepad } from 'react-icons/fa';

// Register ChartJS components
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const API = 'https://simuladortornoyfresadoracnc.somee.com/api/';

// Only include entities that students should have access to (read-only)
const STUDENT_ENTITIES = {
  Matches: 'Match_',
  Practices: 'Practice_',
  GCodes: 'GCode_',
  MachineSettings: 'Machine_Settings_',
  DifficultyLevels: 'Difficulty_level_'
};

// Grupos del sidebar
const SIDEBAR_GROUPS = {
  Explorativo: {
    icon: FaSearch,
    items: ['Matches']
  },
  Programación: {
    icon: FaCode,
    items: ['MachineSettings', 'GCodes']
  },
  Simulación: {
    icon: FaPlay,
    items: ['Practices']
  }
};

const StudentHome = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [practiceScores, setPracticeScores] = useState([]);
  const [practiceDates, setPracticeDates] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState({});
  const [showTornoPath, setShowTornoPath] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({
    Explorativo: false,
    Programación: false,
    Simulación: false
  });
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);

  useEffect(() => {
    // Get current user from localStorage
    const userData = JSON.parse(localStorage.getItem('user')) || {};
    setUser(userData);
    fetchAll(userData);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const fetchAll = async (user) => {
    setLoading(true);
    try {
      const results = {};
      
      // Only fetch allowed entities (read-only)
      for (const [key, endpoint] of Object.entries(STUDENT_ENTITIES)) {
        const res = await axios.get(`${API}${endpoint}`);
        results[key] = res.data;
      }
      
      // Filter data for the current student
      if (results.Matches && user) {
        results.Matches = results.Matches.filter(match => 
          match.user_ID === user.user_ID
        );
        
        // Prepare practice scores and dates for the chart
        const scores = [];
        const dates = [];
        
        results.Matches.forEach(match => {
          if (match.score !== undefined && match.completedAt) {
            scores.push(match.score);
            dates.push(new Date(match.completedAt).toLocaleDateString());
          }
        });
        
        setPracticeScores(scores);
        setPracticeDates(dates);
      }

      // Filter other entities for the current user if they have user_ID field
      if (user) {
        Object.keys(results).forEach(key => {
          if (key !== 'Matches' && results[key] && results[key].length > 0) {
            // Check if the entity has user_ID field and filter by it
            if (results[key][0].hasOwnProperty('user_ID')) {
              results[key] = results[key].filter(item => 
                item.user_ID === user.user_ID
              );
            }
          }
        });
      }

      // Filter other entities for the current user if they have user_ID field
      if (user) {
        Object.keys(results).forEach(key => {
          if (key !== 'Matches' && results[key] && results[key].length > 0) {
            // Check if the entity has user_ID field and filter by it
            if (results[key][0].hasOwnProperty('user_ID')) {
              results[key] = results[key].filter(item => 
                item.user_ID === user.user_ID
              );
            }
          }
        });
      }
      
      setData(results);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Dashboard charts data basado en Matches
  const getDashboardData = () => {
    const matches = data.Matches || [];
    
    // Prácticas por dificultad basado en Matches
    const difficultyData = [
      { name: 'Fácil', count: matches.filter(m => m.difficulty_Level_ID === 1).length },
      { name: 'Intermedio', count: matches.filter(m => m.difficulty_Level_ID === 2).length },
      { name: 'Difícil', count: matches.filter(m => m.difficulty_Level_ID === 3).length }
    ];

    // Puntaje promedio de Matches
    const averageScore = matches.length > 0
      ? (matches.reduce((sum, match) => sum + (match.currentScore || match.score || 0), 0) / matches.length).toFixed(2)
      : 0;

    // Progreso por mes basado en Matches (últimos 6 meses)
    const monthlyProgress = [];
    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = month.toLocaleDateString('es-ES', { month: 'short' });
      const monthMatches = matches.filter(match => {
        const matchDate = new Date(match.startDate || match.createdAt);
        return matchDate.getMonth() === month.getMonth() && 
               matchDate.getFullYear() === month.getFullYear();
      });
      const monthScore = monthMatches.length > 0
        ? (monthMatches.reduce((sum, match) => sum + (match.currentScore || match.score || 0), 0) / monthMatches.length).toFixed(1)
        : 0;
      
      monthlyProgress.push({
        month: monthName,
        score: parseFloat(monthScore),
        practices: monthMatches.length
      });
    }

    return { difficultyData, averageScore, monthlyProgress };
  };

  const { difficultyData, averageScore, monthlyProgress } = getDashboardData();

  const renderTable = () => {
    if (!data[activeTab]?.length) {
      return <div className="no-data">No hay datos disponibles</div>;
    }

    const rawHeaders = Object.keys(data[activeTab][0])
      .filter(key => !['password', 'isDeleted', 'user_Type_ID'].includes(key));
    const idKey = rawHeaders.find(k => /(_id$)|(^id$)/i.test(k)) || rawHeaders[0];
    const headers = [idKey, ...rawHeaders.filter(k => k !== idKey)];

    return (
      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              {headers.map((header, idx) => (
                <th key={header}>{idx === 0 ? 'ID' : header.replace(/_/g, ' ')}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data[activeTab].sort((a, b) => a[idKey] - b[idKey]).map((item, index) => (
              <tr key={index}>
                {headers.map(header => (
                  <td key={header}>
                    {typeof item[header] === 'object' 
                      ? JSON.stringify(item[header])
                      : String(item[header] || '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Función para manejar la eliminación del usuario
  const handleDeleteUser = () => {
    setShowDeleteConfirm(true);
  };

  // Función para confirmar eliminación
  const confirmDeleteUser = () => {
    setShowDeleteConfirm(false);
    setShowEmailPopup(true);
  };

  // Función para cancelar eliminación
  const cancelDeleteUser = () => {
    setShowDeleteConfirm(false);
  };

  // Función para enviar correo de eliminación
  const sendDeleteEmail = () => {
    const subject = `Solicitud de Eliminación de Cuenta - ${user?.name || 'Usuario'}`;
    const body = `Estimado administrador,

El usuario ${user?.name || 'Usuario'} (ID: ${user?.user_ID || 'N/A'}) solicita la eliminación de su cuenta del sistema de gestión CNC.

Datos del usuario:
- Nombre: ${user?.name || 'N/A'}
- Email: ${user?.email || 'N/A'}
- ID de Usuario: ${user?.user_ID || 'N/A'}
- Fecha de solicitud: ${new Date().toLocaleDateString('es-ES')}

Por favor, proceda con la eliminación de la cuenta si es necesario.

Saludos cordiales,
Sistema de Gestión CNC`;

    const mailtoLink = `mailto:nlopezs@ucundinamarca.edu.co?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
    setShowEmailPopup(false);
  };

  // Barra de progreso tipo Duolingo
  const getProgressBar = () => {
    const total = data.Practices?.length || 1;
    const completed = data.Matches?.length || 0;
    const percent = Math.min(100, Math.round((completed / total) * 100));
    return (
      <div className="duo-progress-bar">
        <div className="duo-progress-label">
          <span>¡Hola, {user?.name || 'Estudiante'}!</span>
          <span>{percent}% completado</span>
        </div>
        <div className="duo-progress-track">
          <div className="duo-progress-fill" style={{ width: `${percent}%` }}></div>
        </div>
      </div>
    );
  };

  // Camino de prácticas recientes (stepper visual)
  const getPracticeStepper = () => {
    const recent = (data.Matches || []).slice(0, 5);
    if (!recent.length) return <p>No hay prácticas recientes</p>;
    return (
      <div className="duo-stepper">
        {recent.map((match, idx) => (
          <div key={match.match_ID || idx} className={`duo-step ${match.isFinished ? 'done' : ''}`}>
            <div className="duo-step-circle">
              {match.isFinished ? '✔️' : idx + 1}
            </div>
            <div className="duo-step-info">
              <div className="duo-step-title">
                {match.isFinished ? 'Completada' : 'En progreso'}
              </div>
              <div className="duo-step-date">
                {new Date(match.completedAt || match.createdAt).toLocaleDateString()}
              </div>
              <div className="duo-step-score">
                {match.score !== undefined ? `Puntaje: ${match.score}%` : ''}
              </div>
            </div>
            {idx < recent.length - 1 && <div className="duo-step-line"></div>}
          </div>
        ))}
      </div>
    );
  };

  // Calendario de prácticas
  const getPracticeCalendar = () => {
    const matches = data.Matches || [];
    const practiceDates = {};
    
    matches.forEach(match => {
      const date = new Date(match.startDate || match.createdAt);
      const dateKey = date.toISOString().split('T')[0];
      if (!practiceDates[dateKey]) {
        practiceDates[dateKey] = [];
      }
      practiceDates[dateKey].push(match);
    });

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    return (
      <div className="practice-calendar">
        <h3>Calendario de Prácticas - {monthNames[currentMonth]} {currentYear}</h3>
        <div className="calendar-grid">
          <div className="calendar-header">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
              <div key={day} className="calendar-day-header">{day}</div>
            ))}
          </div>
          <div className="calendar-body">
            {Array.from({ length: startingDayOfWeek }, (_, i) => (
              <div key={`empty-${i}`} className="calendar-day empty"></div>
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const date = new Date(currentYear, currentMonth, day);
              const dateKey = date.toISOString().split('T')[0];
              const dayMatches = practiceDates[dateKey] || [];
              const isToday = date.toDateString() === today.toDateString();
              
              return (
                <div 
                  key={day} 
                  className={`calendar-day ${dayMatches.length > 0 ? 'has-practice' : ''} ${isToday ? 'today' : ''}`}
                >
                  <span className="day-number">{day}</span>
                  {dayMatches.length > 0 && (
                    <div className="practice-indicator">
                      <span className="practice-count">{dayMatches.length}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Resumen de Practices
  const getPracticesSummary = () => {
    const practices = data.Practices || [];
    const matches = data.Matches || [];
    
    const practiceStats = practices.map(practice => {
      const practiceMatches = matches.filter(match => 
        match.practice_ID === practice.practice_ID
      );
      const completedMatches = practiceMatches.filter(match => match.isFinished);
      const avgScore = completedMatches.length > 0 
        ? (completedMatches.reduce((sum, match) => sum + (match.currentScore || match.score || 0), 0) / completedMatches.length).toFixed(1)
        : 0;
      
      return {
        ...practice,
        totalAttempts: practiceMatches.length,
        completedAttempts: completedMatches.length,
        averageScore: avgScore,
        difficulty: practice.difficulty_Level?.difficulty_level_Name || 'N/A'
      };
    });

    return (
      <div className="practices-summary">
        <h3>Resumen de Prácticas</h3>
        <div className="practices-grid">
          {practiceStats.map((practice, index) => (
            <div key={practice.practice_ID || index} className="practice-card">
              <div className="practice-header">
                <h4>{practice.practice_Name}</h4>
                <span className={`difficulty-badge ${practice.difficulty.toLowerCase()}`}>
                  {practice.difficulty}
                </span>
              </div>
              <p className="practice-description">{practice.description}</p>
              <div className="practice-stats">
                <div className="stat">
                  <span className="stat-label">Intentos:</span>
                  <span className="stat-value">{practice.totalAttempts}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Completados:</span>
                  <span className="stat-value">{practice.completedAttempts}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Promedio:</span>
                  <span className="stat-value">{practice.averageScore}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Función para descargar archivos
  const downloadFile = (filename, displayName) => {
    const link = document.createElement('a');
    link.href = `/assets/${filename}`;
    link.download = displayName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Popup para descargar simulador
  const renderDownloadPopup = () => (
    <div className="popup-overlay" onClick={() => setShowDownloadPopup(false)}>
      <div className="popup-content download-popup" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h3>📱 Descargar Simulador y Recursos</h3>
          <button 
            className="popup-close"
            onClick={() => setShowDownloadPopup(false)}
          >
            ×
          </button>
        </div>
        <div className="popup-body">
          <div className="popup-icon">
            <FaDownload />
          </div>
          <p className="popup-message">
            Descarga el simulador de Torno CNC con Realidad Aumentada y los marcadores necesarios para la experiencia completa.
          </p>
          
          <div className="download-options">
            <div className="download-option">
              <div className="download-option-header">
                <div className="download-option-icon">
                  <FaGamepad />
                </div>
                <div className="download-option-info">
                  <h4>Simulador APK</h4>
                  <p>Aplicación móvil para Android</p>
                </div>
              </div>
              <button 
                className="download-btn primary"
                onClick={() => downloadFile('SimuladorTornoARCNC (1).apk', 'SimuladorTornoARCNC.apk')}
              >
                <FaDownload />
                Descargar APK
              </button>
            </div>

            <div className="download-option">
              <div className="download-option-header">
                <div className="download-option-icon">
                  <FaCode />
                </div>
                <div className="download-option-info">
                  <h4>Marcadores AR</h4>
                  <p>Archivos necesarios para la Realidad Aumentada</p>
                </div>
              </div>
              <button 
                className="download-btn secondary"
                onClick={() => downloadFile('MarcadoresAR.rar', 'MarcadoresAR.rar')}
              >
                <FaDownload />
                Descargar Marcadores
              </button>
            </div>
          </div>

          <div className="download-instructions">
            <h4>📋 Instrucciones de Instalación:</h4>
            <ol>
              <li>Descarga el archivo APK en tu dispositivo Android</li>
              <li>Habilita la instalación de aplicaciones de fuentes desconocidas</li>
              <li>Instala la aplicación</li>
              <li>Descarga y extrae los marcadores AR</li>
              <li>Imprime los marcadores en papel blanco</li>
              <li>¡Disfruta de la experiencia de Realidad Aumentada!</li>
            </ol>
          </div>
        </div>
        <div className="popup-footer">
          <button 
            className="popup-btn-secondary"
            onClick={() => setShowDownloadPopup(false)}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );

  // Nuevo: Camino para aprender a manejar un torno (tipo Duolingo)
  const renderTornoPath = () => (
    <div className="torno-path-content">
      <h2>📘 Módulo de Enseñanza: Manejo de Torno CNC con Realidad Aumentada</h2>
      <p style={{marginBottom: 30, color: "#74768d", fontWeight: 500}}>
        ¡Avanza paso a paso y desbloquea cada nivel como en Duolingo! Cada módulo incluye teoría, ejercicios interactivos y simulaciones en Realidad Aumentada.
      </p>
      <div className="duo-stepper" style={{marginBottom: 40}}>
        {/* Paso 1 */}
        <div className="duo-step done">
          <div className="duo-step-circle" style={{background: "#4fc3f7", color: "#fff"}}>✔️</div>
          <div className="duo-step-info">
            <div className="duo-step-title">1. Introducción al Torno</div>
            <div className="duo-step-date" style={{color: "#43a047"}}>Completado</div>
          </div>
          <div className="duo-step-line"></div>
        </div>
        {/* Paso 2 */}
        <div className="duo-step">
          <div className="duo-step-circle" style={{background: "#fffbe7", color: "#ffb347"}}>2</div>
          <div className="duo-step-info">
            <div className="duo-step-title">2. Seguridad y Normas</div>
            <div className="duo-step-date" style={{color: "#ffb347"}}>En progreso</div>
          </div>
          <div className="duo-step-line"></div>
        </div>
        {/* Paso 3 */}
        <div className="duo-step">
          <div className="duo-step-circle" style={{background: "#f5f7fa", color: "#74768d"}}>3</div>
          <div className="duo-step-info">
            <div className="duo-step-title">3. Controles Básicos</div>
            <div className="duo-step-date" style={{color: "#bdbdbd"}}>Por desarrollar</div>
          </div>
          <div className="duo-step-line"></div>
        </div>
        {/* Paso 4 */}
        <div className="duo-step">
          <div className="duo-step-circle" style={{background: "#f5f7fa", color: "#74768d"}}>4</div>
          <div className="duo-step-info">
            <div className="duo-step-title">4. Primer Proyecto</div>
            <div className="duo-step-date" style={{color: "#bdbdbd"}}>Por desarrollar</div>
          </div>
        </div>
      </div>

      {/* Detalle de cada módulo */}
      <div style={{textAlign: "left", maxWidth: 600, margin: "0 auto"}}>
        <div style={{marginBottom: 30}}>
          <div style={{fontWeight: 700, color: "#43a047", marginBottom: 6}}>✅ 1. Introducción al Torno</div>
          <ul style={{marginLeft: 18, color: "#243b4e"}}>
            <li>¿Qué es un torno CNC?</li>
            <li>Funcionamiento general y comparación con torno manual</li>
            <li>Partes principales (RA: modelo 3D interactivo)</li>
            <li>Aplicaciones reales: automotriz, aeroespacial, medicina</li>
            <li>Explora el torno en 360° y descubre sus componentes</li>
          </ul>
        </div>
        <div style={{marginBottom: 30}}>
          <div style={{fontWeight: 700, color: "#ffb347", marginBottom: 6}}>⚠️ 2. Seguridad y Normas</div>
          <ul style={{marginLeft: 18, color: "#243b4e"}}>
            <li>Normas personales y de operación (EPP, ropa, fijación)</li>
            <li>Normas específicas CNC y señales de advertencia</li>
            <li>RA: Identifica errores en un entorno simulado</li>
            <li>Checklist interactivo antes de iniciar la simulación</li>
          </ul>
        </div>
        <div style={{marginBottom: 30}}>
          <div style={{fontWeight: 700, color: "#74768d", marginBottom: 6}}>🎛️ 3. Controles Básicos</div>
          <ul style={{marginLeft: 18, color: "#243b4e"}}>
            <li>Panel de control: ejes, botones, selección de herramienta</li>
            <li>Sistema de coordenadas y programación básica (G/M codes)</li>
            <li>RA: Panel virtual y animación de código ejecutándose</li>
          </ul>
        </div>
        <div style={{marginBottom: 30}}>
          <div style={{fontWeight: 700, color: "#74768d", marginBottom: 6}}>🛠️ 4. Primer Proyecto</div>
          <ul style={{marginLeft: 18, color: "#243b4e"}}>
            <li>Diseño y plano de una pieza simple</li>
            <li>Preparación, fijación y cero pieza</li>
            <li>Secuencia de código G y simulación de mecanizado</li>
            <li>RA: Visualiza la pieza y simula el proceso capa por capa</li>
          </ul>
        </div>
        <div style={{marginBottom: 30, color: "#29b6f6", fontWeight: 600}}>
          🧩 ¡Recuerda! Gana estrellas, repite lecciones y juega minijuegos para dominar cada módulo.
        </div>
      </div>
      <button className="back-dashboard-btn" onClick={() => setShowTornoPath(false)}>
        ← Volver al Dashboard
      </button>
    </div>
  );

  return (
    <div className="dashboard">
      {/* Sidebar con grupos organizados */}
      <aside className={`sidebar ${mobileMenuOpen ? 'active' : ''}`}>
        <div className="logo">
          AR CNC
        </div>
        <nav className="nav-menu">
          {/* Botón Dashboard principal */}
          <button
            className={`nav-main-item ${activeTab === 'Dashboard' && !showTornoPath ? 'active' : ''}`}
            onClick={() => { 
              setActiveTab('Dashboard'); 
              setShowTornoPath(false); 
              closeMobileMenu(); 
            }}
          >
            <FaHome />
            <span>Dashboard</span>
          </button>

          {Object.entries(SIDEBAR_GROUPS).map(([groupName, group]) => {
            const IconComponent = group.icon;
            const isExpanded = expandedGroups[groupName];
            
            return (
              <div key={groupName} className="nav-group">
                <button
                  className="nav-group-header"
                  onClick={() => toggleGroup(groupName)}
                >
                  <IconComponent />
                  <span>{groupName}</span>
                  <span className={`group-arrow ${isExpanded ? 'expanded' : ''}`}>▼</span>
                </button>
                
                {isExpanded && (
                  <div className="nav-group-items">
                    {group.items.map(item => (
                      <button
                        key={item}
                        className={`nav-item ${activeTab === item && !showTornoPath ? 'active' : ''}`}
                        onClick={() => { 
                          setActiveTab(item); 
                          setShowTornoPath(false); 
                          closeMobileMenu(); 
                        }}
                      >
                        {item === 'Matches' && <FaSearch />}
                        {item === 'MachineSettings' && <FaCogs />}
                        {item === 'GCodes' && <FaCode />}
                        {item === 'Practices' && <FaPlay />}
                        <span>{item}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          
          <button
            className="delete-user-btn"
            onClick={() => { handleDeleteUser(); closeMobileMenu(); }}
          >
            <div className="delete-user-icon">
              <FaSignOutAlt />
            </div>
            <div className="delete-user-text">
              <span className="delete-user-title">Eliminar Cuenta</span>
              <span className="delete-user-subtitle">Solicitar eliminación</span>
            </div>
          </button>

          <button
            className="logout-btn"
            onClick={() => { handleLogout(); closeMobileMenu(); }}
          >
            <div className="logout-icon">
              <FaSignOutAlt />
            </div>
            <div className="logout-text">
              <span className="logout-title">Cerrar Sesión</span>
              <span className="logout-subtitle">Salir del sistema</span>
            </div>
          </button>
        </nav>
      </aside>

      {/* Botón hamburguesa para móvil */}
      <button
        className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
        onClick={toggleMobileMenu}
      >
        <div className="hamburger"></div>
        <div className="hamburger"></div>
        <div className="hamburger"></div>
      </button>

      <div className="main-content">
        {loading ? (
          <div className="loading">Cargando datos...</div>
        ) : showTornoPath ? (
          renderTornoPath()
        ) : activeTab === 'Dashboard' ? (
          <div className="dashboard-content">
            {getProgressBar()}
            <h2>¡Bienvenido, {user?.name || 'Estudiante'}!</h2>
            
            {/* Botones principales del Dashboard */}
            <div className="dashboard-actions">
              <button
                className="torno-path-btn"
                onClick={() => setShowTornoPath(true)}
              >
                <FaTrophy style={{marginRight: 8}} />
                ¡Aprende a manejar un torno paso a paso!
              </button>
              
              <button
                className="download-simulator-btn"
                onClick={() => setShowDownloadPopup(true)}
              >
                <FaDownload style={{marginRight: 8}} />
                Descargar Simulador
              </button>
            </div>

            {/* Estadísticas principales */}
            <h3 style={{ marginTop: 30 }}>Estadísticas</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Prácticas Completadas</h3>
                <p>{data.Matches?.length || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Puntaje Promedio</h3>
                <p>{averageScore}%</p>
              </div>
              <div className="stat-card">
                <h3>Códigos G Aprendidos</h3>
                <p>{data.GCodes?.length || 0}</p>
              </div>
            </div>

            {/* Tabla de Matches del usuario actual */}
            <h3 style={{ marginTop: 30 }}>Tus Prácticas Recientes</h3>
            <div className="entity-content">
              {data.Matches && data.Matches.length > 0 ? (
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Máquina</th>
                        <th>Fecha Inicio</th>
                        <th>Fecha Fin</th>
                        <th>Puntaje</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.Matches.slice(0, 10).map((match, index) => (
                        <tr key={match.match_ID || index}>
                          <td>{match.match_ID}</td>
                          <td>Torno CNC</td>
                          <td>{match.startDate ? new Date(match.startDate).toLocaleDateString() : 'N/A'}</td>
                          <td>{match.endDate ? new Date(match.endDate).toLocaleDateString() : 'En progreso'}</td>
                          <td>{match.currentScore || match.score || 0}%</td>
                          <td>
                            <span className={`status-badge ${match.isFinished ? 'completed' : 'in-progress'}`}>
                              {match.isFinished ? 'Completada' : 'En progreso'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-data">No tienes prácticas registradas aún</div>
              )}
            </div>

            {/* Calendario de prácticas */}
            {getPracticeCalendar()}

            {/* Resumen de Practices */}
            {getPracticesSummary()}


            {/* Progreso mensual mejorado */}
            {monthlyProgress.length > 0 && (
              <div className="monthly-progress-section">
                <div className="monthly-progress-header">
                  <h3>📊 Progreso Mensual</h3>
                  <p>Evolución de tu rendimiento en los últimos 6 meses</p>
                </div>
                <div className="monthly-chart-container">
                  <Bar
                    data={{
                      labels: monthlyProgress.map(m => m.month),
                      datasets: [
                        {
                          label: 'Puntaje Promedio (%)',
                          data: monthlyProgress.map(m => m.score),
                          backgroundColor: 'rgba(79, 195, 247, 0.8)',
                          borderColor: 'rgba(79, 195, 247, 1)',
                          borderWidth: 3,
                          borderRadius: 8,
                          borderSkipped: false,
                          yAxisID: 'y'
                        },
                        {
                          label: 'Prácticas Realizadas',
                          data: monthlyProgress.map(m => m.practices),
                          backgroundColor: 'rgba(255, 193, 7, 0.8)',
                          borderColor: 'rgba(255, 193, 7, 1)',
                          borderWidth: 3,
                          borderRadius: 8,
                          borderSkipped: false,
                          yAxisID: 'y1'
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      interaction: {
                        mode: 'index',
                        intersect: false,
                      },
                      scales: {
                        x: {
                          grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                          },
                          ticks: {
                            color: '#2c3e50',
                            font: {
                              size: 13,
                              weight: '600'
                            }
                          }
                        },
                        y: {
                          type: 'linear',
                          display: true,
                          position: 'left',
                          grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                          },
                          ticks: {
                            callback: value => `${value}%`,
                            color: '#2c3e50',
                            font: {
                              size: 12,
                              weight: '500'
                            }
                          },
                          title: {
                            display: true,
                            text: 'Puntaje Promedio (%)',
                            color: '#2c3e50',
                            font: {
                              size: 14,
                              weight: 'bold'
                            }
                          }
                        },
                        y1: {
                          type: 'linear',
                          display: true,
                          position: 'right',
                          grid: {
                            drawOnChartArea: false,
                          },
                          ticks: {
                            callback: value => `${value}`,
                            color: '#2c3e50',
                            font: {
                              size: 12,
                              weight: '500'
                            }
                          },
                          title: {
                            display: true,
                            text: 'Cantidad de Prácticas',
                            color: '#2c3e50',
                            font: {
                              size: 14,
                              weight: 'bold'
                            }
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          position: 'top',
                          labels: {
                            usePointStyle: true,
                            pointStyle: 'circle',
                            padding: 25,
                            font: {
                              size: 13,
                              weight: '600'
                            },
                            color: '#2c3e50'
                          }
                        },
                        tooltip: {
                          backgroundColor: 'rgba(44, 62, 80, 0.95)',
                          titleColor: '#fff',
                          bodyColor: '#fff',
                          borderColor: 'rgba(79, 195, 247, 1)',
                          borderWidth: 2,
                          cornerRadius: 8,
                          titleFont: {
                            size: 14,
                            weight: 'bold'
                          },
                          bodyFont: {
                            size: 13
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="entity-content">
            <h2>{activeTab}</h2>
            {renderTable()}
          </div>
        )}
      </div>

      {/* Popup de descarga */}
      {showDownloadPopup && renderDownloadPopup()}

      {/* Popup de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="popup-overlay" onClick={cancelDeleteUser}>
          <div className="popup-content delete-confirm-popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h3>⚠️ Eliminar Cuenta</h3>
              <button 
                className="popup-close"
                onClick={cancelDeleteUser}
              >
                ×
              </button>
            </div>
            <div className="popup-body">
              <div className="popup-icon" style={{color: '#f44336'}}>
                ⚠️
              </div>
              <p className="popup-message">
                ¿Estás seguro de que deseas <strong>eliminar tu cuenta</strong>? Esta acción no se puede deshacer.
              </p>
              <div className="delete-warning">
                <h4>⚠️ Advertencia:</h4>
                <ul>
                  <li>Se perderán todos tus datos de progreso</li>
                  <li>Se eliminarán tus prácticas y puntajes</li>
                  <li>No podrás recuperar tu cuenta</li>
                  <li>Esta acción es <strong>permanente</strong></li>
                </ul>
              </div>
            </div>
            <div className="popup-footer">
              <button 
                className="popup-btn-cancel"
                onClick={cancelDeleteUser}
              >
                Cancelar
              </button>
              <button 
                className="popup-btn-danger"
                onClick={confirmDeleteUser}
              >
                Sí, Eliminar Cuenta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup de envío de correo */}
      {showEmailPopup && (
        <div className="popup-overlay" onClick={() => setShowEmailPopup(false)}>
          <div className="popup-content email-popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h3>📧 Solicitar Eliminación</h3>
              <button 
                className="popup-close"
                onClick={() => setShowEmailPopup(false)}
              >
                ×
              </button>
            </div>
            <div className="popup-body">
              <div className="popup-icon" style={{color: '#4caf50'}}>
                📧
              </div>
              <p className="popup-message">
                Se abrirá tu cliente de correo para enviar una solicitud de eliminación al administrador.
              </p>
              <div className="email-details">
                <div className="detail-item">
                  <span className="detail-label">📧 Destinatario:</span>
                  <span className="detail-value">nlopezs@ucundinamarca.edu.co</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">📝 Asunto:</span>
                  <span className="detail-value">Solicitud de Eliminación de Cuenta</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">👤 Usuario:</span>
                  <span className="detail-value">{user?.name || 'N/A'}</span>
                </div>
              </div>
            </div>
            <div className="popup-footer">
              <button 
                className="popup-btn-secondary"
                onClick={() => setShowEmailPopup(false)}
              >
                Cancelar
              </button>
              <button 
                className="popup-btn-primary"
                onClick={sendDeleteEmail}
              >
                Enviar Correo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentHome;
