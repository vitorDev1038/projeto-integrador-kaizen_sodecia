import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Link } from 'react-router-dom';
import { ModalPerfil } from './ModalPerfil' // <--- A LINHA QUE FALTAVA
import './Navbar.css';

export function Navbar() {
  const [userAdmin, setUserAdmin] = useState(false);
  const [session, setSession] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) carregarDadosIniciais(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        carregarDadosIniciais(session.user.id);
      } else {
        setUserAdmin(false);
        setPerfil(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function carregarDadosIniciais(userId) {
    const { data } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data) {
      setPerfil(data);
      setUserAdmin(data.is_admin);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
          SODECIA <strong>KAIZEN</strong>
        </Link>
      </div>
      
      <div className="navbar-links">
        {session ? (
          <>
            <Link to="/ranking" className="link-ranking">🏆 Ranking</Link>
            {userAdmin && <Link to="/dashboard">Painel Admin</Link>}
            <Link to="/novo" className="btn-nav-novo">Sugerir Melhoria</Link>
            
            {/* Clique aqui abre o Modal */}
            <div className="user-menu" onClick={() => setIsModalOpen(true)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img 
                src={perfil?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`} 
                alt="Perfil" 
                className="nav-avatar" 
                style={{ width: '35px', height: '35px', borderRadius: '50%', border: '2px solid white' }}
              />
              <span className="nav-username" style={{ color: 'white' }}>
                {perfil?.nome_completo?.split(' ')[0] || 'Usuário'}
              </span>
            </div>

            <button onClick={handleLogout} className="btn-logout">Sair</button>
          </>
        ) : (
          <Link to="/login" className="btn-nav-novo">Entrar</Link>
        )}
      </div>

      {/* COMPONENTE CHAMADO AQUI */}
      <ModalPerfil 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        perfil={perfil}
        onUpdate={(novoPerfil) => setPerfil(novoPerfil)}
      />
    </nav>
  );
}