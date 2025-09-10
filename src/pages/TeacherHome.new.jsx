import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminHome.css';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement);

const API = 'https://simuladortornoyfresadoracnc.somee.com/api/';

// Only include entities that teachers should have access to
const TEACHER_ENTITIES = {
  Matches: 'Match_',
  Practices: 'Practice_',
  GCodes: 'GCode_',
  MachineSettings: 'Machine_Settings_',
  DifficultyLevels: 'Difficulty_level_',
  Users: 'User_' // Only for viewing students
};

const TeacherHome = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [formData, setFormData] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get current user from localStorage
    const user = JSON.parse(localStorage.getItem('user')) || {};
    setCurrentUser(user);
    fetchAll(user);
  }, []);

  const fetchAll = async (user) => {
    setLoading(true);
    try {
      const results = {};
      
      // Only fetch allowed entities
      for (const [key, endpoint] of Object.entries(TEACHER_ENTITIES)) {
        const res = await axios.get(`${API}${endpoint}`);
        
        // Filter users to only show students
        if (key === 'Users') {
          results[key] = res.data.filter(u => u.user_Type?.userType === 'Estudiante');
        } else {
          results[key] = res.data;
        }
      }
      
      // Filter practices to only show those created by the teacher or assigned to their students
      if (results.Practices && user) {
        results.Practices = results.Practices.filter(practice => 
          practice.teacher_ID === user.user_ID || 
          !practice.teacher_ID // Include practices without a specific teacher
        );
      }
      
      setData(results);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const startModal = (type, entity, item = {}) => {
    // Prevent editing certain entities
    if (entity === 'Users' && type !== 'view') return;
    
    setModal({ type, entity });
    setFormData(item);
    setConfirmDelete(null);
  };

  const closeModal = () => {
    setModal(null);
    setFormData({});
    setConfirmDelete(null);
  };

  const handleChange = (e, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = async () => {
    if (!modal) return;
    
    const endpoint = `${API}${TEACHER_ENTITIES[modal.entity]}`;
    
    try {
      // Add teacher ID to new practices
      if (modal.entity === 'Practices' && modal.type === 'create' && currentUser) {
        formData.teacher_ID = currentUser.user_ID;
      }
      
      // Handle different entity types
      if (modal.type === 'create') {
        await axios.post(endpoint, null, { params: formData });
      } else {
        await axios.put(
          `${endpoint}${formData[`${modal.entity.toLowerCase()}_ID`]}`,
          null,
          { params: formData }
        );
      }
      
      closeModal();
      fetchAll(currentUser);
    } catch (err) {
      console.error('Error saving data:', err);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    
    try {
      await axios.delete(`${API}${TEACHER_ENTITIES[confirmDelete.entity]}${confirmDelete.id}`);
      closeModal();
      fetchAll(currentUser);
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  // Dashboard charts data
  const getDashboardData = () => {
    const entitiesData = Object.entries(TEACHER_ENTITIES)
      .filter(([key]) => key !== 'Users') // Exclude Users from the chart
      .map(([key]) => ({
        name: key,
        count: data[key]?.length || 0
      }));

    const difficultyData = data.DifficultyLevels?.map(level => ({
      name: level.difficulty_Level_Name,
      count: data.Practices?.filter(
        p => p.difficulty_Level_ID === level.difficulty_Level_ID
      ).length || 0
    })) || [];

    const studentScores = data.Users?.map(user => ({
      name: `${user.first_Name} ${user.last_Name}`,
      score: user.averageScore || 0
    })).sort((a, b) => b.score - a.score).slice(0, 5) || [];

    return { entitiesData, difficultyData, studentScores };
  };

  const { entitiesData, difficultyData, studentScores } = getDashboardData();

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="logo">Panel del Profesor</div>
        <nav className="nav-menu">
          <button 
            className={activeTab === 'Dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('Dashboard')}
          >
            Dashboard
          </button>
          
          {Object.keys(TEACHER_ENTITIES)
            .filter(entity => entity !== 'Users') // Hide Users from sidebar
            .map(entity => (
              <button
                key={entity}
                className={activeTab === entity ? 'active' : ''}
                onClick={() => setActiveTab(entity)}
              >
                {entity}
              </button>
            ))}
          
          <button 
            className="logout-btn" 
            onClick={() => {
              localStorage.removeItem('user');
              navigate('/login');
            }}
          >
            Cerrar sesión
          </button>
        </nav>
      </div>

      <div className="main-content">
        {loading ? (
          <div>Cargando...</div>
        ) : activeTab === 'Dashboard' ? (
          <div className="dashboard-content">
            <h2>Resumen del Profesor</h2>
            
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Estudiantes</h3>
                <p>{data.Users?.length || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Prácticas Creadas</h3>
                <p>{data.Practices?.length || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Partidas Realizadas</h3>
                <p>{data.Matches?.length || 0}</p>
              </div>
            </div>
            
            <div className="charts-container">
              <div className="chart">
                <h3>Registros por Entidad</h3>
                <Bar
                  data={{
                    labels: entitiesData.map(d => d.name),
                    datasets: [{
                      label: 'Cantidad',
                      data: entitiesData.map(d => d.count),
                      backgroundColor: 'rgba(54, 162, 235, 0.5)',
                      borderColor: 'rgba(54, 162, 235, 1)',
                      borderWidth: 1,
                    }]
                  }}
                  options={{
                    scales: { 
                      y: { 
                        beginAtZero: true, 
                        ticks: { 
                          stepSize: 1,
                          precision: 0
                        } 
                      }
                    }
                  }}
                />
              </div>
              
              <div className="chart">
                <h3>Prácticas por Dificultad</h3>
                <Pie
                  data={{
                    labels: difficultyData.map(d => d.name),
                    datasets: [{
                      data: difficultyData.map(d => d.count),
                      backgroundColor: [
                        'rgba(255, 99, 132, 0.5)',
                        'rgba(54, 162, 235, 0.5)',
                        'rgba(255, 206, 86, 0.5)',
                        'rgba(75, 192, 192, 0.5)',
                        'rgba(153, 102, 255, 0.5)',
                      ],
                      borderWidth: 1,
                    }]
                  }}
                />
              </div>
            </div>
            
            {studentScores.length > 0 && (
              <div className="chart">
                <h3>Top Estudiantes por Puntaje</h3>
                <Bar
                  data={{
                    labels: studentScores.map(s => s.name),
                    datasets: [{
                      label: 'Puntaje Promedio',
                      data: studentScores.map(s => s.score),
                      backgroundColor: 'rgba(75, 192, 192, 0.5)',
                      borderColor: 'rgba(75, 192, 192, 1)',
                      borderWidth: 1,
                    }]
                  }}
                  options={{
                    scales: { 
                      y: { 
                        beginAtZero: true,
                        max: 100,
                        title: {
                          display: true,
                          text: 'Puntaje (%)'
                        }
                      }
                    }
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="table-container">
            <div className="table-header">
              <h2>{activeTab}</h2>
              {activeTab !== 'Users' && (
                <button 
                  className="btn-primary"
                  onClick={() => startModal('create', activeTab)}
                >
                  + Nuevo
                </button>
              )}
            </div>
            
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    {data[activeTab]?.[0] && Object.keys(data[activeTab][0]).map(key => (
                      <th key={key}>
                        {key.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                        ).join(' ')}
                      </th>
                    ))}
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data[activeTab]?.map((item, index) => (
                    <tr key={index}>
                      {Object.entries(item).map(([key, value], i) => (
                        <td key={i}>
                          {typeof value === 'object' 
                            ? JSON.stringify(value)
                            : String(value)}
                        </td>
                      ))}
                      <td className="actions">
                        <button 
                          className="btn-edit"
                          onClick={() => startModal('edit', activeTab, item)}
                        >
                          Editar
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => setConfirmDelete({
                            entity: activeTab,
                            id: item[`${activeTab.toLowerCase()}_ID`]
                          })}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal for create/edit */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>
              {modal.type === 'create' ? 'Crear' : 'Editar'} {modal.entity}
            </h3>
            {Object.entries(modal.type === 'create' ? formData : formData).map(([key, value]) => {
              if (key.endsWith('_ID') || key === 'createdAt' || key === 'updatedAt') return null;
              
              return (
                <div key={key} className="form-group">
                  <label>
                    {key.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                    ).join(' ')}
                  </label>
                  <input
                    type={key.toLowerCase().includes('password') ? 'password' : 'text'}
                    value={value || ''}
                    onChange={(e) => handleChange(e, key)}
                    disabled={key.endsWith('_ID') || key === 'createdAt' || key === 'updatedAt'}
                  />
                </div>
              );
            })}
            <div className="modal-actions">
              <button className="btn-secondary" onClick={closeModal}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleSubmit}>
                {modal.type === 'create' ? 'Crear' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirmar Eliminación</h3>
            <p>¿Estás seguro de que deseas eliminar este registro?</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={closeModal}>
                Cancelar
              </button>
              <button className="btn-delete" onClick={handleDelete}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherHome;
