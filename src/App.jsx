import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { NovoKaizen } from './pages/NovoKaizen';
import { Login } from './pages/Login';
import { Cadastro } from './pages/Cadastro';
import { RecuperarSenha } from './pages/RecuperarSenha';
import { ResetPassword } from './pages/ResetPassword';
import { Ranking } from './pages/Ranking';
import { VisualizarKaizen } from './pages/VisualizarKaizen';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/novo" element={<NovoKaizen />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/kaizen/:id" element={<VisualizarKaizen />} />
      </Routes>
    </Router>
  );
}

export default App;