import './App.css';
import { Routes, Route } from 'react-router-dom';
import Home from './views/Home';
import Login from './views/Login';
import Register from './views/Register';
import DashboardDocente from './views/DashboardDocente';
import DashboardAdministrador from './views/DashboardAdministrador';
import DashboardPadre from './views/DashboardPadre';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard-docente" element={<DashboardDocente />} />
        <Route path="/dashboard-administrador" element={<DashboardAdministrador />} />
        <Route path="/dashboard-padre" element={<DashboardPadre />} />
      </Routes>
    </div>
  );
}

export default App;
