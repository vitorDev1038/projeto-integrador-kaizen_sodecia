import { useState } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css'; 

export function Cadastro() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleCadastro(e) {
    e.preventDefault();
    if (loading) return; 

    setLoading(true);

    try {
      // 1. Criar o usuário enviando o nome nos metadados
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome_completo: nome,
          }
        }
      });

      if (authError) throw authError;

      if (data.user) {
        // Tenta inserir o perfil (caso não tenha trigger no banco)
        const { error: perfilError } = await supabase
          .from('perfis')
          .insert([
            { 
              id: data.user.id, 
              nome_completo: nome, 
              is_admin: false 
            }
          ]);

        // Se der erro de RLS aqui, o código abaixo ainda tenta logar você
        if (perfilError && perfilError.code !== '23505') {
           console.warn("Perfil não inserido manualmente, tentando login direto...");
        }

        // 2. MUDANÇA: Login Automático Imediato
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!loginError) {
          navigate('/dashboard'); 
        } else {
          alert("Conta criada! Por favor, faça login manualmente.");
          navigate('/login');
        }
      }
    } catch (err) {
      if (err.status === 429 || err.message.includes('rate limit')) {
        alert("Limite de tentativas atingido. Como você já mudou no painel, verifique se salvou as alterações de 'Rate Limits'.");
      } else {
        alert("Erro no cadastro: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Criar Conta Sodecia</h2>
        
        <form onSubmit={handleCadastro} className="auth-form">
          <div className="input-group">
            <label>Nome Completo</label>
            <input 
              type="text" 
              placeholder="Seu nome completo"
              value={nome} 
              onChange={e => setNome(e.target.value)} 
              required 
            />
          </div>

          <div className="input-group">
            <label>E-mail</label>
            <input 
              type="email" 
              placeholder="seu.email@sodecia.com"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="input-group">
            <label>Senha</label>
            <input 
              type="password" 
              placeholder="Mínimo 6 caracteres"
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? 'Criando conta...' : 'Finalizar Cadastro'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Já tem uma conta? <Link to="/login">Faça Login</Link></p>
        </div>
      </div>
    </div>
  );
}