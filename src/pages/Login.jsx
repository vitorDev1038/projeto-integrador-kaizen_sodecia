import { useState } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Tratamento específico para facilitar seus testes
        if (error.message.includes("Email not confirmed")) {
          alert("Este e-mail ainda não foi confirmado. Verifique as configurações de 'Confirm Email' no seu Supabase.");
        } else if (error.status === 400) {
          alert("E-mail ou senha incorretos. Verifique se digitou corretamente.");
        } else {
          alert("Erro no login: " + error.message);
        }
      } else if (data.user) {
        // Login realizado com sucesso
        navigate('/dashboard');
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
      alert("Ocorreu um erro ao tentar conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Acesso Kaizen</h2>
        <form className="auth-form" onSubmit={handleLogin}>
          <div className="input-group">
            <label>E-mail</label>
            <input 
              type="email" 
              placeholder="vitor@exemplo.com" 
              value={email}
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div className="input-group">
            <label>Senha</label>
            <input 
              type="password" 
              placeholder="Sua senha" 
              value={password}
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          
          <div className="auth-options">
            <Link to="/recuperar-senha">Esqueci minha senha</Link>
          </div>
          
          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? 'Validando...' : 'Entrar'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Não tem conta? <Link to="/cadastro">Cadastre-se</Link></p>
        </div>
      </div>
    </div>
  );
}