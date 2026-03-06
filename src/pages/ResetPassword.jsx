import { useState } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

export function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  async function handleUpdate(e) {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      alert("Erro ao atualizar: " + error.message);
    } else {
      alert("Senha atualizada com sucesso! Agora você pode logar.");
      navigate('/login');
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Definir Nova Senha</h2>
        <form className="auth-form" onSubmit={handleUpdate}>
          <label>Nova Senha</label>
          <input 
            type="password" 
            placeholder="No mínimo 6 caracteres" 
            onChange={(e) => setNewPassword(e.target.value)} 
            required 
          />
          <button className="btn-auth">Salvar Senha</button>
        </form>
      </div>
    </div>
  );
}