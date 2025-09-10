import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SelectionPage.css';
import tornoImage from '../assets/TORNO.png';
import fresadoraImage from '../assets/fresadora.png';

function SelectionPage() {
  const navigate = useNavigate();

  return (
    <div className="selection-container">
      <div className="twinkle-layer" aria-hidden="true" />
      {/* Primera sección - Título y texto animado */}
      <section className="intro-section">
        <div className="intro-content">
          <h1 className="main-title">AR-CNC</h1>
          <p className="intro-text">Bienvenido al simulador de máquinas CNC.</p>
          <div className="scroll-indicator">
            Scroll para ver las opciones
            <div className="mouse-scroll">
              <div className="mouse-wheel"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Segunda sección - Botones grandes */}
      <section className="machines-section">
        <div className="machines-container">
          <div className="machine-card" onClick={() => navigate('/hometorno')}>
            <img src={tornoImage} alt="Torno CNC" className="machine-image" />
            <div className="machine-overlay">
              <h2>TORNO CNC</h2>
            </div>
          </div>

          <div className="machine-card" onClick={() => navigate('/homefresadora')}>
            <img src={fresadoraImage} alt="Fresadora CNC" className="machine-image" />
            <div className="machine-overlay">
              <h2>FRESADORA CNC</h2>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SelectionPage; 