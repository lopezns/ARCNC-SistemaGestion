import React, { useEffect, useState } from 'react';
import './HomeFresadora.css';
import { useNavigate } from 'react-router-dom';

function HomeFresadora() {
  const [currentFrame, setCurrentFrame] = useState(1);
  const [showHeader, setShowHeader] = useState(true);
  const [loading, setLoading] = useState(true);
  const totalFrames = 160;
  const scrollsToComplete = 1.2;
  const navigate = useNavigate();
  const [images, setImages] = useState([]);

  const preloadImages = async () => {
    const loadedImages = [];
    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      img.src = `./assets/anim/${padNumber(i)}.webp`;
      loadedImages.push(img);
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    setImages(loadedImages);
    setLoading(false);
  };

  useEffect(() => {
    preloadImages();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 2) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }

      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const totalScrollDistance = windowHeight * scrollsToComplete;
      const effectiveScroll = Math.min(scrollPosition, totalScrollDistance);
      let scrollFraction = effectiveScroll / totalScrollDistance;
      
      if (scrollFraction > 0.5) {
        scrollFraction = 0.5 + Math.pow((scrollFraction - 0.5) * 2, 2) / 2;
      }
      
      const frame = Math.min(totalFrames, Math.ceil(scrollFraction * totalFrames));
      setCurrentFrame(Math.max(1, frame));
    };

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

  // Detectar si es móvil
  const isMobile = window.innerWidth <= 768;

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader-inner">
          <h1 className="loading-text">Cargando...</h1>
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
        </div>
      </div>
    );    
  }

  return (
    <div className="HomeFresadora">
      {/* Header especial para móvil */}
      {isMobile && (
        <header className="header-mobile">
          <button className="icon-btn" onClick={() => navigate('/selectionpage')} aria-label="Regresar">
            {/* Flecha izquierda SVG */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <span className="mobile-title">Fresadora CNC | AR</span>
          <button className="icon-btn" onClick={() => navigate('/login')} aria-label="Login">
            {/* Login SVG (puerta con flecha) */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          </button>
        </header>
      )}

      {/* Header original solo en desktop */}
      {!isMobile && (
        <header className="header">
          <div className="header-content">
            <button className="btn-login" onClick={() => navigate('/selectionpage')}>
              Regresar
            </button>
            <div className="logo-text">Fresadora CNC | AR</div>
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
            style={{ transform: 'scaleX(-1)' }}
          />
        </div>
      </div>

      {/* Scroll Indicator como en SelectionPage */}
      {currentFrame === 1 && (
        <div className="scroll-indicator scroll-indicator-fresadora">
          Scroll para ver más acerca del proyecto
          <div className="mouse-scroll">
            <div className="mouse-wheel"></div>
          </div>
        </div>
      )}

      {/* Título Grande en Frame 1 */}
      {currentFrame === 1 && (
        <div className="large-title2" style={{ textAlign: 'left', position: 'absolute', right: '20px' }}>
          FRESADORA CNC | AR
          <div className="subtitle2" style={{ textAlign: 'left' }}>
            Proyecto de Grado UdeC
          </div>
        </div>
      )}

      {/* Nueva sección después de la animación */}
      <div className="post-animation-content">
        <div className="content-section">
          <h2>Bienvenido al Simulador de Fresadora CNC </h2>
          <p>Explora las capacidades de nuestro sistema de realidad aumentada para el aprendizaje de torneado CNC.</p>
          <div className="feature-grid">
            <div className="feature-item">
              <h3>Simulación Realista</h3>
              <p>Experimenta con controles y operaciones reales de torno CNC</p>
            </div>
            <div className="feature-item">
              <h3>Realidad Aumentada</h3>
              <p>Visualiza el proceso de mecanizado en tiempo real</p>
            </div>
            <div className="feature-item">
              <h3>Aprendizaje Interactivo</h3>
              <p>Aprende a través de ejercicios prácticos y tutoriales guiados</p>
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

export default HomeFresadora;
