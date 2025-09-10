import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomeSelection from './pages/SelectionPage';
import HomeTorno from './pages/HomeTorno';
import HomeFresadora from './pages/HomeFresadora';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminHome from './pages/AdminHome';
import TeacherHome from './pages/TeacherHome';
import StudentHome from './pages/StudentHome';
import Tutorials from './pages/Tutorials';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeSelection />} />
        <Route path="/hometorno" element={<HomeTorno />} />
        <Route path="/homefresadora" element={<HomeFresadora />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/teacher" element={<TeacherHome />} />
        <Route path="/student" element={<StudentHome />} />
        <Route path="/tutorials" element={<Tutorials />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App; 