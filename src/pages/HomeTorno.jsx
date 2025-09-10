import React, { useEffect, useState } from 'react';
import './HomeTorno.css';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [currentFrame, setCurrentFrame] = useState(1);
  const [showHeader, setShowHeader] = useState(true);
  const [loading, setLoading] = useState(true);
  const totalFrames = 160;
  const scrollsToComplete = 2;
  const navigate = useNavigate();
  const [images, setImages] = useState([]);

  const preloadImages = async () => {
    const loadedImages = [];
    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      img.src = `/assets/scrollanimation/${padNumber(i)}.webp`;
      loadedImages.push(img);
      // Carga en lotes de 10 imágenes
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Espera un poco entre cargas
      }
    }
    setImages(loadedImages);
    setLoading(false); // Cambia el estado de carga a false cuando todas las imágenes están listas
  };

  useEffect(() => {
    preloadImages();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Header visibility
      if (window.scrollY > 50) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }

      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const totalScrollDistance = windowHeight * scrollsToComplete;

      // Limitar el scroll efectivo al total necesario
      const effectiveScroll = Math.min(scrollPosition, totalScrollDistance);
      
      // Calcular la fracción de scroll con el scroll efectivo
      let scrollFraction = effectiveScroll / totalScrollDistance;
      
      // Aplicar una función de aceleración cuadrática después de la mitad
      if (scrollFraction > 0.5) {
        scrollFraction = 0.5 + Math.pow((scrollFraction - 0.5) * 2, 2) / 2;
      }
      
      // Asegurar que el último frame se muestre cuando llegamos al final del scroll efectivo
      const frameFloat = scrollFraction * totalFrames;
      const frame = Math.min(totalFrames, Math.ceil(frameFloat));

      if (scrollPosition === 0) {
        setCurrentFrame(1);
      } else {
        setCurrentFrame(Math.max(1, frame));
      }
    };

    // Usar requestAnimationFrame para hacer el scroll más suave
    let ticking = false;
    const scrollListener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', scrollListener);
    return () => window.removeEventListener('scroll', scrollListener);
  }, []);

  const padNumber = (number) => number.toString().padStart(4, '0');
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader" aria-label="Cargando">
          <div className="box box0"><div></div></div>
          <div className="box box1"><div></div></div>
          <div className="box box2"><div></div></div>
          <div className="box box3"><div></div></div>
          <div className="box box4"><div></div></div>
          <div className="box box5"><div></div></div>
          <div className="box box6"><div></div></div>
          <div className="box box7"><div></div></div>
          <div className="ground"><div></div></div>
        </div>
      </div>
    );
  }
  
  // Detectar si es móvil
  const isMobile = window.innerWidth <= 768;

  return (
    <div className="Home">
      {/* Header especial para móvil */}
      {isMobile && (
        <header className="header-mobile">
          <button className="icon-btn" onClick={() => navigate('/selectionpage')} aria-label="Regresar">
            {/* Flecha izquierda SVG */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <span className="mobile-title">Torno CNC | AR</span>
          <button className="icon-btn" onClick={() => navigate('/login')} aria-label="Login">
            {/* Login SVG (puerta con flecha) */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          </button>
        </header>
      )}

      {/* Header original solo en desktop */}
      {!isMobile && showHeader && (
        <header className={`header ${showHeader ? 'visible' : 'hidden'}`}>
          <div className="header-content">
            <button className="btn-login" onClick={() => navigate('/selectionpage')}>
              Regresar
            </button>
            <div className="logo-text">Torno CNC | AR</div>
            <div className="header-buttons">
              <button className="btn-login" onClick={() => navigate('/login')}>Login</button>
            </div>
          </div>
        </header>
      )}

      {/* Scroll Animation */}
      <div className="scroll-container">
        <div className="sticky-container">
          <img
            src={images[currentFrame - 1]?.src}
            alt={`Frame ${currentFrame}`}
          />
        </div>
      </div>

      {/* Scroll for More Message */}
      {currentFrame === 1 && (
        <div className="scroll-indicator scroll-indicator-torno">
          Scroll para ver más acerca del proyecto
          <div className="mouse-scroll">
            <div className="mouse-wheel"></div>
          </div>
        </div>
      )}

      {/* Título Grande en Frame 1 */}
      {currentFrame === 1 && (
        <div className="large-title">
          TORNO CNC | AR
          <div className="subtitle">Proyecto de Grado UdeC</div>
        </div>
      )}

      {/* Nueva sección después de la animación */}
      <div className="post-animation-content">
        <div className="content-section">
          <h2>Bienvenido al Simulador de Torno CNC</h2>
          <p>El Simulador de Torno CNC con Realidad Aumentada es una solución educativa diseñada para transformar la enseñanza técnica en entornos donde el acceso a maquinaria especializada es limitado o inexistente. A través de una experiencia inmersiva, segura y accesible desde cualquier dispositivo móvil, esta herramienta permite a estudiantes de ingeniería y formación técnica interactuar con un torno CNC virtual, programarlo en lenguaje G-code y simular operaciones de mecanizado en tiempo real.</p>
          <div className="feature-grid">
            <div className="feature-item">
              <h3><span className="feature-icon" aria-hidden>⚙️</span> Simulación Realista</h3>
              <p>Experimenta con controles y operaciones reales de torno CNC sin los costos ni riesgos de los talleres físicos. Nuestro simulador reproduce fielmente las operaciones de mecanizado, permitiendo a los estudiantes programar en lenguaje G-code y ejecutar operaciones complejas de torneado. La simulación incluye todas las variables reales del proceso, desde la selección de herramientas hasta el control de velocidades y profundidades de corte, proporcionando una experiencia auténtica que prepara a los estudiantes para los desafíos de la Industria 4.0.</p>
            </div>
            <div className="feature-item">
              <h3><span className="feature-icon" aria-hidden>🧠</span> Realidad Aumentada</h3>
              <p>Visualiza el proceso de mecanizado en tiempo real a través de tecnología de realidad aumentada avanzada. Nuestra plataforma ofrece una experiencia inmersiva que permite ver el material siendo procesado, las herramientas en acción y los resultados del mecanizado de forma virtual pero realista. La realidad aumentada facilita la comprensión de conceptos complejos, mejora la retención de información y proporciona una experiencia de aprendizaje superior que combina lo visual con lo interactivo.</p>
            </div>
            <div className="feature-item">
              <h3><span className="feature-icon" aria-hidden>📚</span> Aprendizaje Interactivo</h3>
              <p>Aprende a través de ejercicios prácticos y tutoriales guiados basados en el modelo de aprendizaje experiencial de Kolb. Nuestro enfoque modular promueve el pensamiento lógico, la autonomía y la comprensión práctica. El sistema incluye ejercicios progresivos, retroalimentación inmediata y seguimiento del progreso individual. Compatible con instituciones educativas de bajos recursos, democratiza el acceso a tecnologías de vanguardia, aportando innovación, flexibilidad y calidad a los procesos de enseñanza-aprendizaje.</p>
            </div>
          </div>
          <button className="start-button" onClick={() => navigate('/login')}>
            Comenzar
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
