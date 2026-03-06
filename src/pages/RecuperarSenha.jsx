import { useState } from 'react';
import { supabase } from '../services/supabase';
import { Link } from 'react-router-dom';
import './Auth.css';

export function RecuperarSenha() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleReset(e) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:5173/reset-password', // URL do seu site (mude para o domínio real depois)
    });

    if (error) {
      alert("Erro: " + error.message);
    } else {
      alert("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
    }
    setLoading(false);
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Recuperar Senha</h2>
        <p style={{ textAlign: 'center', marginBottom: '20px', fontSize: '14px', color: '#666' }}>
          Digite seu e-mail para receber um link de redefinição.
        </p>
        <form className="auth-form" onSubmit={handleReset}>
          <label>E-mail Corporativo</label>
          <input type="email" onChange={(e) => setEmail(e.target.value)} required />
          <button className="btn-auth" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Link'}
          </button>
        </form>
        <div className="auth-footer">
          <Link to="/login">Voltar para o Login</Link>
        </div>
      </div>
    </div>
  );
}