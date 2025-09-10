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

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement);

const API = 'https://simuladortornoyfresadoracnc.somee.com/api/';

const ENTITIES = {
  Users: 'User_',
  Workpieces: 'Workpiece_',
  Materials: 'Material_',
  GCodes: 'GCode_',
  MachineSettings: 'Machine_Settings_',
  DifficultyLevels: 'Difficulty_level_',
  ErrorTypes: 'Error_Type_',
  Practices: 'Practice_',
  Permissions: 'Permission_',
  UserPermissions: 'User_Permission_',
  UserTypes: 'User_Type_',
  Matches: 'Match_'
};

export default function AdminHome() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { type, entity, item }
  const [formData, setFormData] = useState({});
  const [userTypes, setUserTypes] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [matchFilterType, setMatchFilterType] = useState('Todos');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const results = {};
      
      for (const [key, endpoint] of Object.entries(ENTITIES)) {
        const res = await axios.get(`${API}${endpoint}`);
        results[key] = res.data;
      }
      
      setData(results);
      setUserTypes(results.UserTypes || []);
    } catch (err) {
      console.error('Error al cargar:', err);
    } finally {
      setLoading(false);
    }
  };
  

  const startModal = (type, entity, item = {}) => {
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
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async () => {
    const endpoint = `${API}${ENTITIES[modal.entity]}`;
    try {
      if (modal.entity === 'Users') {
        const params = {
          First_Name: formData.first_Name,
          Last_Name: formData.last_Name,
          Email: formData.email,
          User_Type_ID: parseInt(formData.user_Type_ID),
        };
      
        if (modal.type === 'create') {
          params.Password = formData.password;
          await axios.post(endpoint, null, { params });
        } else {
          await axios.put(`${endpoint}/${formData.user_ID}`, null, { params });
        }
  
      } else if (modal.entity === 'Workpieces') {
        const params = {
          Workpiece_Name: formData.workpiece_Name,
          Description: formData.description,
          Length: parseFloat(formData.length),
          Width: parseFloat(formData.width),
          Height: parseFloat(formData.height),
          Unit: formData.unit,
          Predefined_GCode: formData.predefined_GCode,
          Material_ID: parseInt(formData.material?.material_ID)
        };
        if (modal.type === 'create') {
          await axios.post(endpoint, null, { params });
        } else {
          await axios.put(`${endpoint}/${formData.workpiece_ID}`, null, { params });
        }
  
      } else if (modal.entity === 'Materials') {
        const params = {
          Material_Name: formData.material_Name
        };
        if (modal.type === 'create') {
          await axios.post(endpoint, null, { params });
        } else {
          await axios.put(`${endpoint}/${formData.material_ID}`, null, { params });
        }
  
      } else if (modal.entity === 'GCodes') {
        const params = {
          Match_ID: parseInt(formData.match?.match_ID),
          Code: formData.code
        };
        if (modal.type === 'create') {
          await axios.post(endpoint, null, { params });
        } else {
          await axios.put(`${endpoint}/${formData.gCode_ID}`, null, { params });
        }
  
      } else if (modal.entity === 'MachineSettings') {
        const params = {
          Match_ID: parseInt(formData.match?.match_ID),
          SpindleSpeed: parseFloat(formData.spindleSpeed),
          FeedRate: parseFloat(formData.feedRate),
          DepthCut: parseFloat(formData.depthCut)
        };
        if (modal.type === 'create') {
          await axios.post(endpoint, null, { params });
        } else {
          await axios.put(`${endpoint}/${formData.machine_Settings_ID}`, null, { params });
        }
  
      } else if (modal.entity === 'DifficultyLevels') {
        const params = { Difficulty_Level_Name: formData.difficulty_level_Name };
        if (modal.type === 'create') {
          await axios.post(endpoint, null, { params });
        } else {
          await axios.put(`${endpoint}/${formData.difficulty_level_ID}`, null, { params });
        }
  
      } else if (modal.entity === 'ErrorTypes') {
        const params = { Description: formData.description };
        if (modal.type === 'create') {
          await axios.post(endpoint, null, { params });
        } else {
          await axios.put(`${endpoint}/${formData.error_Type_ID}`, null, { params });
        }
  
      } else if (modal.entity === 'Practices') {
        const params = {
          Practice_Name: formData.practice_Name,
          Description: formData.description,
          Difficulty_level_ID: parseInt(formData.difficulty_Level?.difficulty_level_ID),
          Workpiece_ID: parseInt(formData.workpiece?.workpiece_ID)
        };
        if (modal.type === 'create') {
          await axios.post(endpoint, null, { params });
        } else {
          await axios.put(`${endpoint}/${formData.practice_ID}`, null, { params });
        }
  
      } else if (modal.entity === 'Permissions') {
        const params = { PermissionName: formData.permissionName };
        if (modal.type === 'create') {
          await axios.post(endpoint, null, { params });
        } else {
          await axios.put(`${endpoint}/${formData.permission_ID}`, null, { params });
        }
  
      } else if (modal.entity === 'UserPermissions') {
        const params = {
          User_Type_ID: parseInt(formData.user_Type?.user_Type_ID),
          Permission_ID: parseInt(formData.permission?.permission_ID)
        };
        if (modal.type === 'create') {
          await axios.post(endpoint, null, { params });
        } else {
          await axios.put(`${endpoint}/${formData.userP_ID}`, null, { params });
        }
  
      } else if (modal.entity === 'UserTypes') {
        const params = { UserType: formData.userType };
        if (modal.type === 'create') {
          await axios.post(endpoint, null, { params });
        } else {
          await axios.put(`${endpoint}/${formData.user_Type_ID}`, null, { params });
        }
  
      } else if (modal.entity === 'Matches') {
        const params = {
          User_ID: parseInt(formData.user?.user_ID),
          StartDate: formData.startDate,
          EndDate: formData.endDate,
          IsFinished: formData.isFinished,
          PositionX: formData.positionX || 0,
          PositionY: formData.positionY || 0,
          PositionZ: formData.positionZ || 0,
          CurrentScore: parseInt(formData.currentScore) || 0
        };
      
        const machineType = formData.machineType || 'Torno';
      
        if (modal.type === 'create') {
          await axios.post(`${endpoint}/${machineType}`, null, { params });
        } else {
          await axios.put(`${endpoint}/${machineType}/${formData.match_ID}`, null, { params });
        }
      }
      
      closeModal();
      fetchAll();
    } catch (err) {
      alert('Error al guardar: ' + err.message);
    }
  };
  
  

  const handleDelete = async (entity, id) => {
    try {
      const endpoint = entity === 'Users'
        ? `${API}User_/${id}`
        : `${API}${ENTITIES[entity]}/${id}`;
  
      await axios.delete(endpoint);
      closeModal();
      fetchAll();
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  };
  

  const renderDashboard = () => {
    const metrics = Object.keys(data).map(key => ({
      name: key,
      count: Array.isArray(data[key]) ? data[key].length : 0
    }));

    const barData = {
      labels: metrics.map(m => m.name),
      datasets: [
        {
          label: 'Registros por Entidad',
          data: metrics.map(m => m.count),
          backgroundColor: '#5e87eb'
        }
      ]
    };

    const barOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            font: {
              size: 12
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            font: {
              size: 11
            }
          }
        },
        x: {
          ticks: {
            font: {
              size: 11
            }
          }
        }
      }
    };
  
    const userTypeCounts = {};
    (data.Users || []).forEach(u => {
      const type = u.user_Type?.userType || 'Desconocido';
      userTypeCounts[type] = (userTypeCounts[type] || 0) + 1;
    });
  
    const pieData = {
      labels: Object.keys(userTypeCounts),
      datasets: [
        {
          data: Object.values(userTypeCounts),
          backgroundColor: ['#4a6fc9', '#0d9d58', '#f6ad55', '#ed64a6']
        }
      ]
    };

    const pieOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            font: {
              size: 12
            }
          }
        }
      }
    };
  
    const scores = (data.Matches || []).map(m => m.currentScore || 0);
    const avgScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : 0;
  
    const usersScoreMap = {};
    (data.Matches || []).forEach(m => {
      const uid = m.user?.user_ID;
      if (uid) {
        const name = `${m.user.first_Name} ${m.user.last_Name}`;
        usersScoreMap[name] = (usersScoreMap[name] || 0) + (m.currentScore || 0);
      }
    });
  
    const topUsers = Object.entries(usersScoreMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  
    const topUserData = {
      labels: topUsers.map(([name]) => name),
      datasets: [
        {
          label: 'Puntaje total',
          data: topUsers.map(([, score]) => score),
          backgroundColor: '#f56565'
        }
      ]
    };
  
    const difficultyData = {};
    (data.Practices || []).forEach(p => {
      const level = p.difficulty_Level?.difficulty_level_Name || 'Desconocido';
      difficultyData[level] = (difficultyData[level] || 0) + 1;
    });
  
    const difficultyChart = {
      labels: Object.keys(difficultyData),
      datasets: [
        {
          label: 'Prácticas por dificultad',
          data: Object.values(difficultyData),
          backgroundColor: '#48bb78'
        }
      ]
    };
  
    const evolution = {};
    (data.Practices || []).forEach(p => {
      const fecha = new Date(p.createdAt || p.updatedAt || Date.now()).toISOString().split('T')[0];
      evolution[fecha] = (evolution[fecha] || 0) + 1;
    });
  
    const evolutionChart = {
      labels: Object.keys(evolution),
      datasets: [
        {
          label: 'Prácticas por fecha',
          data: Object.values(evolution),
          fill: false,
          borderColor: '#805ad5',
          tension: 0.1
        }
      ]
    };
  
    return (
      <div className="dashboard-charts">
        {/* Botones de crear entidades principales */}
        <div className="dashboard-create-buttons" style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <button className="dashboard-create-btn" onClick={() => startModal('create', 'Matches')}>Crear Match</button>
          <button className="dashboard-create-btn" onClick={() => startModal('create', 'GCodes')}>Crear GCode</button>
          <button className="dashboard-create-btn" onClick={() => startModal('create', 'Materials')}>Crear Material</button>
          <button className="dashboard-create-btn" onClick={() => startModal('create', 'Workpieces')}>Crear Workpiece</button>
        </div>
        <div className="chart-container">
          <h3>Distribución de Registros</h3>
          <Bar data={barData} options={barOptions} />
        </div>
        {Object.keys(userTypeCounts).length > 0 && (
          <div className="chart-container">
            <h3>Tipos de Usuario</h3>
            <Pie data={pieData} options={pieOptions} />
          </div>
        )}
        <div className="chart-container">
          <h3>Puntaje Promedio: {avgScore}</h3>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#4CAF50'
          }}>
            {avgScore}
          </div>
        </div>
        <div className="chart-container">
          <h3>Top Usuarios por Puntaje</h3>
          <Bar data={topUserData} options={barOptions} />
        </div>
        <div className="chart-container">
          <h3>Prácticas por Dificultad</h3>
          <Bar data={difficultyChart} options={barOptions} />
        </div>
        <div className="chart-container">
          <h3>Evolución de Prácticas</h3>
          <Bar data={evolutionChart} options={barOptions} />
        </div>
      </div>
    );
  };
  

  const renderTable = (entity, items) => {
    if (!items || items.length === 0) return <p>No hay registros.</p>;
  
    let keys = Object.keys(items[0]).slice(0, 4);
    let headers = keys;
  
    if (entity === 'Users') {
      keys = ['user_ID', 'first_Name', 'last_Name', 'email', 'user_Type'];
      headers = ['ID', 'Nombre', 'Apellido', 'Email', 'Tipo'];
    } else if (entity === 'Workpieces') {
      keys = ['workpiece_ID', 'workpiece_Name', 'description', 'length', 'width', 'height', 'unit', 'predefined_GCode', 'material'];
      headers = ['ID', 'Nombre', 'Descripción', 'Longitud', 'Ancho', 'Alto', 'Unidad', 'GCode', 'Material'];
    } else if (entity === 'Materials') {
      keys = ['material_ID', 'material_Name'];
      headers = ['ID', 'Nombre'];
    } else if (entity === 'GCodes') {
      keys = ['gCode_ID', 'code', 'match'];
      headers = ['ID', 'Código', 'Match'];
    } else if (entity === 'MachineSettings') {
      keys = ['machine_Settings_ID', 'spindleSpeed', 'feedRate', 'depthCut', 'match'];
      headers = ['ID', 'Velocidad del husillo', 'Velocidad de avance', 'Profundidad de corte', 'Match'];
    } else if (entity === 'DifficultyLevels') {
      keys = ['difficulty_level_ID', 'difficulty_level_Name'];
      headers = ['ID', 'Nivel de dificultad'];
    } else if (entity === 'ErrorTypes') {
      keys = ['error_Type_ID', 'description'];
      headers = ['ID', 'Tipo de error'];
    } else if (entity === 'Practices') {
      keys = ['practice_ID', 'practice_Name', 'description', 'difficulty_Level', 'workpiece'];
      headers = ['ID', 'Nombre', 'Descripción', 'Nivel de dificultad', 'Workpiece'];
    } else if (entity === 'Permissions') {
      keys = ['permission_ID', 'permissionName'];
      headers = ['ID', 'Permiso'];
    } else if (entity === 'UserPermissions') {
      keys = ['userP_ID', 'user_Type', 'permission'];
      headers = ['ID', 'Tipo de usuario', 'Permiso'];
    } else if (entity === 'UserTypes') {
      keys = ['user_Type_ID', 'userType'];
      headers = ['ID', 'Tipo de usuario'];
    } else if (entity === 'Matches') {
      keys = ['match_ID', 'machineType', 'user', 'startDate', 'endDate', 'currentScore', 'isFinished'];
      headers = ['ID', 'Máquina', 'Usuario', 'Inicio', 'Fin', 'Puntaje', 'Finalizado'];
    }
  
    let filteredItems = items;
    if (entity === 'Matches' && matchFilterType !== 'Todos') {
      filteredItems = items.filter(item => item.machineType === matchFilterType);
    }
  
    return (
      <div className="table-wrapper">
        <div className="table-header">
          <h2>{entity}</h2>
          <button onClick={() => startModal('create', entity)}>Crear nuevo</button>
        </div>
  
        {entity === 'Matches' && (
          <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label>Filtrar por máquina:</label>
            <select value={matchFilterType} onChange={e => setMatchFilterType(e.target.value)}>
              <option value="Todos">Todos</option>
              <option value="Torno">Torno</option>
              <option value="Fresadora">Fresadora</option>
            </select>
          </div>
        )}
  
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {headers.map((h, i) => <th key={i}>{h}</th>)}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, i) => (
                <tr key={i}>
                  {keys.map(k => (
                    <td key={k}>
                      {k === 'user_Type'
                        ? item[k]?.userType || '—'
                        : k === 'material'
                          ? item[k]?.material_Name || '—'
                          : k === 'match'
                            ? `Match ${item[k]?.match_ID}` || '—'
                            : k === 'user'
                              ? `${item[k]?.first_Name || ''} ${item[k]?.last_Name || ''}`.trim()
                              : k === 'difficulty_Level'
                                ? item[k]?.difficulty_level_Name || '—'
                                : k === 'workpiece'
                                  ? item[k]?.workpiece_Name || '—'
                                  : k === 'permission'
                                    ? item[k]?.permissionName || '—'
                                    : typeof item[k] === 'object' && item[k] !== null
                                      ? Object.entries(item[k]).map(([key, value]) => `${key}: ${value}`).join(', ')
                                      : item[k]}
                    </td>
                  ))}
                  <td>
                    <button onClick={() => startModal('edit', entity, item)}>Editar</button>
                    <button onClick={() => startModal('delete', entity, item)}>
                      {confirmDelete === item[keys[0]] ? 'Confirmar' : 'Eliminar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  

  const renderForm = () => {
    if (!modal) return null;
    const isUser = modal.entity === 'Users';
  
    return (
      <div className="modal-overlay">
        <div className="modal">
          <h3>
            {modal.type === 'create' ? 'Crear' : modal.type === 'edit' ? 'Editar' : 'Eliminar'} {modal.entity}
          </h3>
  
          {modal.type === 'delete' ? (
            <>
              <p>¿Estás seguro que deseas eliminar este registro?</p>
              <div className="modal-actions">
                <button className="confirm-btn" onClick={() => handleDelete(modal.entity, formData[Object.keys(formData)[0]])}>Eliminar</button>
                <button className="cancel-btn" onClick={closeModal}>Cancelar</button>
              </div>
            </>
          ) : (
            <>
              {isUser ? (
                <>
                  <input placeholder="Nombre" value={formData.first_Name || ''} onChange={(e) => handleChange(e, 'first_Name')} />
                  <input placeholder="Apellido" value={formData.last_Name || ''} onChange={(e) => handleChange(e, 'last_Name')} />
                  <input placeholder="Email" value={formData.email || ''} onChange={(e) => handleChange(e, 'email')} />
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                    <select
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e0',
                        fontSize: '14px',
                        backgroundColor: '#fff',
                        color: '#1a202c',
                      }}
                      value={formData.user_Type_ID || ''}
                      onChange={(e) => handleChange(e, 'user_Type_ID')}
                    >
                      <option value="">Seleccione Tipo</option>
                      {userTypes.map(ut => (
                        <option key={ut.user_Type_ID} value={ut.user_Type_ID}>{ut.user_Type}</option>
                      ))}
                    </select>
                  </div>
                  {modal.type === 'create' && (
                    <input placeholder="Contraseña" type="password" value={formData.password || ''} onChange={(e) => handleChange(e, 'password')} />
                  )}
                </>
              ) : modal.entity === 'Workpieces' ? (
                <>
                  <input placeholder="Nombre" value={formData.workpiece_Name || ''} onChange={(e) => handleChange(e, 'workpiece_Name')} />
                  <input placeholder="Descripción" value={formData.description || ''} onChange={(e) => handleChange(e, 'description')} />
                  <input type="number" placeholder="Longitud" value={formData.length || ''} onChange={(e) => handleChange(e, 'length')} />
                  <input type="number" placeholder="Ancho" value={formData.width || ''} onChange={(e) => handleChange(e, 'width')} />
                  <input type="number" placeholder="Altura" value={formData.height || ''} onChange={(e) => handleChange(e, 'height')} />
                  <input placeholder="Unidad" value={formData.unit || ''} onChange={(e) => handleChange(e, 'unit')} />
                  <input placeholder="GCode predefinido" value={formData.predefined_GCode || ''} onChange={(e) => handleChange(e, 'predefined_GCode')} />
                  <select
                    value={formData.material?.material_ID || ''}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        material: { material_ID: parseInt(e.target.value) }
                      }))
                    }
                  >
                    <option value="">Seleccione Material</option>
                    {data.Materials?.map(m => (
                      <option key={m.material_ID} value={m.material_ID}>
                        {m.material_Name}
                      </option>
                    ))}
                  </select>
                </>
              ) : modal.entity === 'Materials' ? (
                <>
                  <input placeholder="Nombre del material" value={formData.material_Name || ''} onChange={(e) => handleChange(e, 'material_Name')} />
                </>
              ) : modal.entity === 'GCodes' ? (
                <>
                  <input placeholder="Código G" value={formData.code || ''} onChange={(e) => handleChange(e, 'code')} />
                  <input type="number" placeholder="ID del Match" value={formData.match?.match_ID || ''} onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      match: { match_ID: parseInt(e.target.value) }
                    }))
                  } />
                </>
              ) : modal.entity === 'MachineSettings' ? (
                <>
                  <input type="number" placeholder="Velocidad del husillo" value={formData.spindleSpeed || ''} onChange={(e) => handleChange(e, 'spindleSpeed')} />
                  <input type="number" placeholder="Velocidad de avance" value={formData.feedRate || ''} onChange={(e) => handleChange(e, 'feedRate')} />
                  <input type="number" placeholder="Profundidad de corte" value={formData.depthCut || ''} onChange={(e) => handleChange(e, 'depthCut')} />
                  <select
                    value={formData.match?.match_ID || ''}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        match: { match_ID: parseInt(e.target.value) }
                      }))
                    }
                  >
                    <option value="">Seleccione Match</option>
                    {data.Matches?.map(m => (
                      <option key={m.match_ID} value={m.match_ID}>
                        Match #{m.match_ID} - Score: {m.currentScore}
                      </option>
                    ))}
                  </select>
                </>
                ) : modal.entity === 'DifficultyLevels' ? (          // 📍 Nueva entidad
                  <>
                    <input
                      placeholder="Nombre del nivel de dificultad"
                      value={formData.difficulty_level_Name || ''}
                      onChange={e => handleChange(e, 'difficulty_level_Name')}
                    />
                  </>
                ) : modal.entity === 'ErrorTypes' ? (                // 📍 Nueva entidad
                  <>
                    <input
                      placeholder="Descripción del tipo de error"
                      value={formData.description || ''}
                      onChange={e => handleChange(e, 'description')}
                    />
                  </>
                ) : modal.entity === 'Practices' ? (                 // 📍 Nueva entidad
                  <>
                    <input
                      placeholder="Nombre de la práctica"
                      value={formData.practice_Name || ''}
                      onChange={e => handleChange(e, 'practice_Name')}
                    />
                    <input
                      placeholder="Descripción"
                      value={formData.description || ''}
                      onChange={e => handleChange(e, 'description')}
                    />
                    <select
                      value={formData.difficulty_Level?.difficulty_level_ID || ''}
                      onChange={e => setFormData(prev => ({
                        ...prev,
                        difficulty_Level: { difficulty_level_ID: parseInt(e.target.value) }
                      }))}
                    >
                      <option value="">Seleccione Dificultad</option>
                      {data.DifficultyLevels?.map(dl => (
                        <option key={dl.difficulty_level_ID} value={dl.difficulty_level_ID}>
                          {dl.difficulty_level_Name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={formData.workpiece?.workpiece_ID || ''}
                      onChange={e => setFormData(prev => ({
                        ...prev,
                        workpiece: { workpiece_ID: parseInt(e.target.value) }
                      }))}
                    >
                      <option value="">Seleccione Workpiece</option>
                      {data.Workpieces?.map(wp => (
                        <option key={wp.workpiece_ID} value={wp.workpiece_ID}>
                          {wp.workpiece_Name}
                        </option>
                      ))}
                    </select>
                  </>
                ) : modal.entity === 'Permissions' ? (             // 📍 Nueva entidad
                  <>
                    <input
                      placeholder="Nombre del permiso"
                      value={formData.permissionName || ''}
                      onChange={e => handleChange(e, 'permissionName')}
                    />
                  </>
                ) : modal.entity === 'UserPermissions' ? (          // 📍 Nueva entidad
                  <>
                    <select
                      value={formData.user_Type?.user_Type_ID || ''}
                      onChange={e => setFormData(prev => ({
                        ...prev,
                        user_Type: { user_Type_ID: parseInt(e.target.value) }
                      }))}
                    >
                      <option value="">Tipo de usuario</option>
                      {data.UserTypes?.map(ut => (
                        <option key={ut.user_Type_ID} value={ut.user_Type_ID}>
                          {ut.userType}
                        </option>
                      ))}
                    </select>
                    <select
                      value={formData.permission?.permission_ID || ''}
                      onChange={e => setFormData(prev => ({
                        ...prev,
                        permission: { permission_ID: parseInt(e.target.value) }
                      }))}
                    >
                      <option value="">Permiso</option>
                      {data.Permissions?.map(p => (
                        <option key={p.permission_ID} value={p.permission_ID}>
                          {p.permissionName}
                        </option>
                      ))}
                    </select>
                  </>
                ) : modal.entity === 'UserTypes' ? (              // 📍 Nueva entidad
                  <>
                    <input
                      placeholder="Nombre del tipo de usuario"
                      value={formData.userType || ''}
                      onChange={e => handleChange(e, 'userType')}
                    />
                  </>
                ) : modal.entity === 'Matches' ? (                  // 📍 Nueva entidad
                  <>
                    <select
                      value={formData.machineType || ''}
                      onChange={(e) => handleChange(e, 'machineType')}
                    >
                      <option value="">Seleccione Tipo de Máquina</option>
                      <option value="Torno">Torno</option>
                      <option value="Fresadora">Fresadora</option>
                    </select>

                    <select
                      value={formData.user?.user_ID || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        user: { user_ID: parseInt(e.target.value) }
                      }))}
                    >
                      <option value="">Seleccione Usuario</option>
                      {data.Users?.filter(u => u.user_Type?.userType === 'Estudiante').map(u => (
                        <option key={u.user_ID} value={u.user_ID}>
                          {u.first_Name} {u.last_Name}
                        </option>
                      ))}
                    </select>

                    <input type="datetime-local" placeholder="Fecha Inicio" value={formData.startDate || ''} onChange={e => handleChange(e, 'startDate')} />
                    <input type="datetime-local" placeholder="Fecha Fin" value={formData.endDate || ''} onChange={e => handleChange(e, 'endDate')} />
                    <input type="number" placeholder="Puntaje actual" value={formData.currentScore || ''} onChange={e => handleChange(e, 'currentScore')} />
                    <div>
                      <label>
                        <input type="checkbox" checked={!!formData.isFinished} onChange={e => handleChange(e, 'isFinished', e.target.checked)} />
                        Finalizada
                      </label>
                    </div>

                  </>
                ) : (
                  Object.entries(formData).map(([key, value]) => (
                    <input key={key} placeholder={key} value={value ?? ''} onChange={(e) => handleChange(e, key)} />
                  ))
                )}
    
                <div className="modal-actions">
                  <button className="confirm-btn" onClick={handleSubmit}>Guardar</button>
                  <button className="cancel-btn" onClick={closeModal}>Cancelar</button>
                </div>
              </>
            )}
          </div>
        </div>
      );
    };
              
  

  return (
    <div className="dashboard">
      {console.log("🎯 Renderizando AdminHome, estado:", { activeTab, loading, dataKeys: Object.keys(data), mobileMenuOpen })}
      
      {/* Botón hamburguesa para móvil */}
      <button 
        className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
        onClick={toggleMobileMenu}
      >
        <div className="hamburger"></div>
        <div className="hamburger"></div>
        <div className="hamburger"></div>
      </button>

      <aside className={`sidebar ${mobileMenuOpen ? 'active' : ''}`}>
        {console.log("🔍 Renderizando sidebar")}
        <div className="logo" onClick={() => navigate('/login')}>AR CNC</div>
        <div className="nav-menu">
          {console.log("🔍 Renderizando nav-menu")}
          <button onClick={() => { setActiveTab('Dashboard'); closeMobileMenu(); }} className={activeTab === 'Dashboard' ? 'active' : ''}>Dashboard</button>
          <button onClick={() => { navigate('/tutorials'); closeMobileMenu(); }} className="tutorials-btn">
            Tutoriales Interactivos
          </button>
          {Object.keys(ENTITIES).map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); closeMobileMenu(); }} className={activeTab === tab ? 'active' : ''}>
              {tab}
            </button>
          ))}
        </div>
        <button className="logout-btn" onClick={() => navigate('/login')}>Cerrar Sesión</button>
      </aside>

      <main className="main-content">
        {console.log("🔍 Renderizando main-content, loading:", loading, "activeTab:", activeTab)}
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <>
            {activeTab === 'Dashboard' ? (
              <>
                {console.log("🔍 Renderizando Dashboard")}
                {renderDashboard()}
              </>
            ) : (
              <>
                {console.log("🔍 Renderizando Tabla:", activeTab)}
                {renderTable(activeTab, data[activeTab])}
              </>
            )}
          </>
        )}
      </main>

      {renderForm()}
    </div>
  );
}
