import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Link } from 'react-router-dom';
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
            
            {/* Avatar que abre o modal */}
            <div className="user-menu" onClick={() => setIsModalOpen(true)}>
              <img 
                src={perfil?.avatar_url || 'https://via.placeholder.com/150'} 
                alt="Perfil" 
                className="nav-avatar" 
              />
              <span className="nav-username">{perfil?.nome_completo?.split(' ')[0]}</span>
            </div>

            <button onClick={handleLogout} className="btn-logout">Sair</button>
          </>
        ) : (
          <Link to="/login" className="btn-nav-novo">Entrar</Link>
        )}
      </div>

      {/* Aqui entrará o componente ModalPerfil que criaremos a seguir */}
    </nav>
  );
}