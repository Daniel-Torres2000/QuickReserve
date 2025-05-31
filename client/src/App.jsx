import './App.css';
import { Routes, Route } from 'react-router-dom';
import Home from './views/Home';
import Login from './views/Login';
import Register from './views/Register';
import DocenteDashboard from './views/DocenteDashboard';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/docente-dashboard" element={<DocenteDashboard />} />
      </Routes>
    </div>
  );
}

export default App;
