import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TeacherHome.css';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Get current user from localStorage or context
    const user = JSON.parse(localStorage.getItem('user')) || {};
    setCurrentUser(user);
    fetchAll(user);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const fetchAll = async (user) => {
    setLoading(true);
    try {
      const results = {};
      
      // First, fetch user types to ensure we have the correct mapping
      const userTypesRes = await axios.get(`${API}User_Type_`);
      const studentTypeId = userTypesRes.data.find(type => 
        type.user_Type_ID === 3 || type.userType?.toLowerCase() === 'estudiante'
      )?.user_Type_ID;
      
      if (!studentTypeId) {
        console.error('No se pudo encontrar el tipo de usuario Estudiante');
        return;
      }

      // Only fetch allowed entities
      for (const [key, endpoint] of Object.entries(TEACHER_ENTITIES)) {
        const res = await axios.get(`${API}${endpoint}`);
        
        // Process users to only show students and clean up data
        if (key === 'Users') {
          results[key] = res.data
            .filter(u => 
              u.user_Type?.user_Type_ID === studentTypeId || 
              u.user_Type_ID === studentTypeId ||
              (u.user_Type && u.userType === 'Estudiante')
            )
            .map(({ password, isDeleted, user_Type, user_Type_ID, ...user }) => ({
              ...user,
              // Simplify user type to just the name or ID
              user_Type: user_Type?.userType || 
                        (user_Type_ID === 1 ? 'Admin' : 
                         user_Type_ID === 2 ? 'Teacher' : 'Student')
            }));
          console.log('Estudiantes cargados:', results[key]);
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
        await axios.put(`${endpoint}${formData[`${modal.entity.toLowerCase()}_ID`]}`, null, { params: formData });
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
    // Exclude Users from the entities chart since it's only for students
    const entitiesData = Object.entries(TEACHER_ENTITIES)
      .filter(([key]) => key !== 'Users')
      .map(([key]) => ({
        name: key,
        count: data[key]?.length || 0
      }));

    const difficultyData = data.DifficultyLevels?.map(level => ({
      name: level.difficulty_Level_Name,
      count: data.Practices?.filter(p => p.difficulty_Level_ID === level.difficulty_Level_ID).length || 0
    })) || [];

    // Calculate student scores if we have matches data
    const studentScores = [];
    if (data.Users && data.Matches) {
      const studentScoreMap = {};
      
      // Calculate average score for each student
      data.Matches.forEach(match => {
        if (match.user_ID && match.score !== undefined) {
          const student = data.Users.find(u => u.user_ID === match.user_ID);
          if (student) {
            const studentName = `${student.first_Name} ${student.last_Name}`;
            if (!studentScoreMap[studentName]) {
              studentScoreMap[studentName] = { total: 0, count: 0 };
            }
            studentScoreMap[studentName].total += match.score;
            studentScoreMap[studentName].count += 1;
          }
        }
      });

      // Convert to array and sort by average score
      Object.entries(studentScoreMap).forEach(([name, { total, count }]) => {
        studentScores.push({
          name,
          score: Math.round((total / count) * 100) / 100
        });
      });

      studentScores.sort((a, b) => b.score - a.score);
    }

    return { entitiesData, difficultyData, studentScores: studentScores.slice(0, 5) };
  };

  const { entitiesData, difficultyData, studentScores } = getDashboardData();

  return (
    <div className="dashboard">
      {/* Botón hamburguesa para móvil */}
      <button 
        className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
        onClick={toggleMobileMenu}
      >
        <div className="hamburger"></div>
        <div className="hamburger"></div>
        <div className="hamburger"></div>
      </button>

      <div className={`sidebar ${mobileMenuOpen ? 'active' : ''}`}>
        <div className="logo">AR CNC Teacher Panel</div>
        <nav className="nav-menu">
          <button 
            className={activeTab === 'Dashboard' ? 'active' : ''}
            onClick={() => { setActiveTab('Dashboard'); closeMobileMenu(); }}
          >
            Dashboard
          </button>
          
          <button 
            className="tutorials-btn"
            onClick={() => { navigate('/tutorials'); closeMobileMenu(); }}
          >
            📚 Tutoriales Interactivos
          </button>
          
          {Object.keys(TEACHER_ENTITIES).map(entity => (
            <button
              key={entity}
              className={activeTab === entity ? 'active' : ''}
              onClick={() => { setActiveTab(entity); closeMobileMenu(); }}
            >
              {entity}
            </button>
          ))}
          
          <button className="logout-btn" onClick={() => {
            localStorage.removeItem('user');
            navigate('/login');
          }}>
            Cerrar Sesión
          </button>
        </nav>
      </div>

      <div className="main-content">
        {loading ? (
          <div>Loading...</div>
        ) : activeTab === 'Dashboard' ? (
          <div className="dashboard-content">
            <h2>Dashboard del Profesor</h2>
            
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
              <div className="chart-container">
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
                    responsive: true,
                    maintainAspectRatio: false,
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
              
              <div className="chart-container">
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
                  options={{
                    responsive: true,
                    maintainAspectRatio: false
                  }}
                />
              </div>
            </div>
            
            {studentScores.length > 0 && (
              <div className="charts-container">
                <div className="chart-container">
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
                      responsive: true,
                      maintainAspectRatio: false,
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
                    {data[activeTab]?.[0] && (() => {
                          const filteredKeys = Object.keys(data[activeTab][0])
                            .filter(key => !['password', 'isDeleted', 'user_Type_ID'].includes(key));
                          return filteredKeys.map((key, idx) => (
                            <th key={key}>{idx === 0 ? 'ID' : key.replace(/_/g, ' ')}</th>
                          ));
                        })()}
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data[activeTab]?.map((item, index) => {
                    // Create a clean item without sensitive fields
                    const cleanItem = Object.fromEntries(
                      Object.entries(item)
                        .filter(([key]) => !['password', 'isDeleted', 'user_Type_ID'].includes(key))
                        .map(([key, value]) => [
                          key,
                          // Format user_Type to show just the name
                          key === 'user_Type' && value && typeof value === 'object' 
                            ? value.userType || value 
                            : value
                        ])
                    );
                    
                    return (
                      <tr key={index}>
                        {(() => {
                             const filteredKeys = Object.keys(cleanItem);
                             return filteredKeys.map((k,i)=>(
                               <td key={i}>
                                 {typeof cleanItem[k] === 'object' ? JSON.stringify(cleanItem[k]) : String(cleanItem[k])}
                               </td>
                             ));
                           })()}
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
                    );
                  })}
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
            <h3>{modal.type === 'create' ? 'Crear' : 'Editar'} {modal.entity}</h3>
            {Object.entries(modal.type === 'create' ? {} : formData).map(([key, value]) => (
              <div key={key} className="form-group">
                <label>{key.replace(/_/g, ' ')}</label>
                <input
                  type="text"
                  value={value || ''}
                  onChange={(e) => handleChange(e, key)}
                  disabled={key.endsWith('_ID') || key === 'createdAt' || key === 'updatedAt'}
                />
              </div>
            ))}
            <div className="modal-actions">
              <button className="btn-secondary" onClick={closeModal}>Cancelar</button>
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
              <button className="btn-secondary" onClick={closeModal}>Cancelar</button>
              <button className="btn-delete" onClick={handleDelete}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherHome;
