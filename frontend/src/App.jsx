import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register         from './pages/Register';
import Login            from './pages/Login';
import AdminDashboard   from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import TeacherHistory   from './pages/TeacherHistory';
import StudentHistory   from './pages/StudentHistory';
import './App.css';

export default function App() {
  return (
    <div className="app-wrapper">
      <BrowserRouter>
        <Routes>
          <Route path="/"            element={<Navigate to="/login" />} />
          <Route path="/register"    element={<Register />} />
          <Route path="/login"       element={<Login />} />
          <Route path="/admin"       element={<AdminDashboard />} />
          <Route path="/student"     element={<StudentDashboard />} />
          <Route path="/scan/:token" element={<StudentDashboard />} />
          <Route path="/teacher-history"  element={<TeacherHistory />} />
          <Route path="/student-history"  element={<StudentHistory />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}