import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Tutorials.css';

const Tutorials = () => {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(0);
  const [completedLevels, setCompletedLevels] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [userProgress, setUserProgress] = useState(0);
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null);

  // Obtener progreso guardado del localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('tutorialProgress');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setCompletedLevels(progress.completedLevels || []);
      setUserProgress(progress.userProgress || 0);
    }
  }, []);

  // Guardar progreso en localStorage
  const saveProgress = (newCompletedLevels, newProgress) => {
    const progressData = {
      completedLevels: newCompletedLevels,
      userProgress: newProgress,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('tutorialProgress', JSON.stringify(progressData));
  };

  const tutorials = [
    {
      id: 1,
      title: "Introducción al Torno CNC",
      description: "Aprende los conceptos básicos del torno CNC y su interfaz",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
      duration: "5:30",
      difficulty: "Principiante",
      badge: "🎯",
      badgeName: "Explorador",
      quiz: {
        question: "¿Qué significa CNC?",
        options: [
          "Control Numérico Computarizado",
          "Centro de Navegación Central",
          "Comando Numérico de Control",
          "Computadora Numérica Central"
        ],
        correct: 0
      }
    },
    {
      id: 2,
      title: "Navegación en el Simulador",
      description: "Descubre cómo moverte por el entorno virtual del torno",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      duration: "7:15",
      difficulty: "Principiante",
      badge: "🎮",
      badgeName: "Navegador",
      quiz: {
        question: "¿Cuál es la función principal del panel de control?",
        options: [
          "Solo mostrar información",
          "Controlar todas las operaciones del torno",
          "Decorar la interfaz",
          "Ninguna de las anteriores"
        ],
        correct: 1
      }
    },
    {
      id: 3,
      title: "Programación en G-Code",
      description: "Aprende a escribir y entender código G para el torno",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      duration: "12:45",
      difficulty: "Intermedio",
      badge: "💻",
      badgeName: "Programador",
      quiz: {
        question: "¿Qué comando G se usa para movimiento lineal?",
        options: [
          "G00",
          "G01",
          "G02",
          "G03"
        ],
        correct: 1
      }
    },
    {
      id: 4,
      title: "Simulación de Operaciones",
      description: "Practica diferentes operaciones de torneado",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      duration: "15:20",
      difficulty: "Intermedio",
      badge: "⚙️",
      badgeName: "Operador",
      quiz: {
        question: "¿Qué operación se usa para crear superficies cilíndricas?",
        options: [
          "Fresado",
          "Torneado",
          "Taladrado",
          "Lijado"
        ],
        correct: 1
      }
    },
    {
      id: 5,
      title: "Optimización de Parámetros",
      description: "Aprende a ajustar velocidades y profundidades de corte",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      duration: "18:30",
      difficulty: "Avanzado",
      badge: "🚀",
      badgeName: "Optimizador",
      quiz: {
        question: "¿Qué factor NO afecta la velocidad de corte?",
        options: [
          "Diámetro de la pieza",
          "Velocidad del husillo",
          "Color de la herramienta",
          "Material de la pieza"
        ],
        correct: 2
      }
    },
    {
      id: 6,
      title: "Resolución de Problemas",
      description: "Identifica y soluciona errores comunes en el torneado",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      duration: "20:15",
      difficulty: "Avanzado",
      badge: "🔧",
      badgeName: "Técnico",
      quiz: {
        question: "¿Qué indica una vibración excesiva durante el torneado?",
        options: [
          "Todo está funcionando perfectamente",
          "Posible desbalanceo o parámetros incorrectos",
          "La máquina está nueva",
          "Es normal en todas las operaciones"
        ],
        correct: 1
      }
    }
  ];

  const handleVideoComplete = () => {
    setShowQuiz(true);
  };

  const handleQuizComplete = (selectedOption) => {
    const currentTutorial = tutorials[currentLevel];
    const isCorrect = selectedOption === currentTutorial.quiz.correct;
    
    if (isCorrect) {
      const newCompletedLevels = [...completedLevels, currentTutorial.id];
      const newProgress = Math.round(((newCompletedLevels.length) / tutorials.length) * 100);
      
      setCompletedLevels(newCompletedLevels);
      setUserProgress(newProgress);
      setQuizCompleted(true);
      
      // Mostrar logro
      setCurrentAchievement({
        badge: currentTutorial.badge,
        title: `¡${currentTutorial.badgeName} Desbloqueado!`,
        message: `Has completado: ${currentTutorial.title}`,
        description: `¡Excelente trabajo! Has dominado ${currentTutorial.description.toLowerCase()}`
      });
      setShowAchievement(true);
      
      // Guardar progreso
      saveProgress(newCompletedLevels, newProgress);
      
      // Ocultar logro después de 3 segundos
      setTimeout(() => {
        setShowAchievement(false);
        setCurrentAchievement(null);
        setShowQuiz(false);
        setQuizCompleted(false);
        
        // Avanzar al siguiente nivel si no es el último
        if (currentLevel < tutorials.length - 1) {
          setCurrentLevel(currentLevel + 1);
        }
      }, 3000);
    } else {
      alert("Respuesta incorrecta. ¡Inténtalo de nuevo!");
    }
  };

  const handleLevelSelect = (levelIndex) => {
    if (levelIndex === 0 || completedLevels.includes(tutorials[levelIndex - 1]?.id)) {
      setCurrentLevel(levelIndex);
      setShowQuiz(false);
      setQuizCompleted(false);
    } else {
      alert("Debes completar el nivel anterior primero");
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Principiante": return "#4CAF50";
      case "Intermedio": return "#FF9800";
      case "Avanzado": return "#F44336";
      default: return "#9E9E9E";
    }
  };

  return (
    <div className="tutorials-container">
      <div className="tutorials-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Volver
        </button>
        <h1>Tutoriales Interactivos</h1>
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${userProgress}%` }}
            ></div>
          </div>
          <span className="progress-text">{userProgress}% Completado</span>
        </div>
      </div>

      <div className="tutorials-content">
        <div className="levels-sidebar">
          <h3>Niveles de Aprendizaje</h3>
          {tutorials.map((tutorial, index) => (
            <div
              key={tutorial.id}
              className={`level-item ${currentLevel === index ? 'active' : ''} ${
                completedLevels.includes(tutorial.id) ? 'completed' : ''
              } ${index > 0 && !completedLevels.includes(tutorials[index - 1]?.id) ? 'locked' : ''}`}
              onClick={() => handleLevelSelect(index)}
            >
              <div className="level-badge">
                {completedLevels.includes(tutorial.id) ? tutorial.badge : index + 1}
              </div>
              <div className="level-info">
                <h4>Nivel {index + 1}: {tutorial.title}</h4>
                <p>{tutorial.description}</p>
                <span 
                  className="difficulty-badge"
                  style={{ backgroundColor: getDifficultyColor(tutorial.difficulty) }}
                >
                  {tutorial.difficulty}
                </span>
                <span className="duration">{tutorial.duration}</span>
              </div>
              {completedLevels.includes(tutorial.id) && (
                <div className="completion-check">✓</div>
              )}
            </div>
          ))}
        </div>

        <div className="tutorial-main">
          {!showQuiz ? (
            <div className="video-section">
              <h2>{tutorials[currentLevel].title}</h2>
              <div className="video-container">
                <iframe
                  src={tutorials[currentLevel].videoUrl}
                  title={tutorials[currentLevel].title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="video-info">
                <p>{tutorials[currentLevel].description}</p>
                <div className="video-meta">
                  <span className="duration">Duración: {tutorials[currentLevel].duration}</span>
                  <span 
                    className="difficulty"
                    style={{ color: getDifficultyColor(tutorials[currentLevel].difficulty) }}
                  >
                    {tutorials[currentLevel].difficulty}
                  </span>
                </div>
                <button 
                  className="complete-video-btn"
                  onClick={handleVideoComplete}
                >
                  He completado el video
                </button>
              </div>
            </div>
          ) : (
            <div className="quiz-section">
              <h2>¡Pon a prueba tu conocimiento!</h2>
              <div className="quiz-card">
                <h3>{tutorials[currentLevel].quiz.question}</h3>
                <div className="quiz-options">
                  {tutorials[currentLevel].quiz.options.map((option, index) => (
                    <button
                      key={index}
                      className="quiz-option"
                      onClick={() => handleQuizComplete(index)}
                      disabled={quizCompleted}
                    >
                      {String.fromCharCode(65 + index)}. {option}
                    </button>
                  ))}
                </div>
                {quizCompleted && (
                  <div className="quiz-feedback correct">
                    ¡Correcto! Has completado este nivel exitosamente.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Achievement Modal */}
      {showAchievement && currentAchievement && (
        <div className="achievement-modal">
          <div className="achievement-content">
            <div className="achievement-badge">{currentAchievement.badge}</div>
            <h3>{currentAchievement.title}</h3>
            <p>{currentAchievement.message}</p>
            <p className="achievement-description">{currentAchievement.description}</p>
          </div>
        </div>
      )}

      {/* Achievements Panel */}
      <div className="achievements-panel">
        <h3>Logros Desbloqueados</h3>
        <div className="achievements-grid">
          {tutorials.map(tutorial => (
            <div 
              key={tutorial.id}
              className={`achievement-item ${completedLevels.includes(tutorial.id) ? 'unlocked' : 'locked'}`}
            >
              <div className="achievement-badge">
                {completedLevels.includes(tutorial.id) ? tutorial.badge : '🔒'}
              </div>
              <div className="achievement-info">
                <h4>{tutorial.badgeName}</h4>
                <p>{tutorial.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tutorials; 