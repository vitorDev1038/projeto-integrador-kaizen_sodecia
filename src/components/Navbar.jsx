import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Link } from 'react-router-dom';
import './Navbar.css';

export function Navbar() {
  const [userAdmin, setUserAdmin] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkAdminStatus(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkAdminStatus(session.user.id);
      } else {
        setUserAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkAdminStatus(userId) {
    const { data } = await supabase
      .from('perfis')
      .select('is_admin')
      .eq('id', userId)
      .single();
    setUserAdmin(data?.is_admin || false);
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
            {/* Link do Ranking visível para todos os logados */}
            <Link to="/ranking" className="link-ranking">
              <span>🏆</span> Ranking
            </Link>

            {userAdmin && <Link to="/dashboard">Painel Admin</Link>}
            
            <Link to="/novo" className="btn-nav-novo">Sugerir Melhoria</Link>
            
            <button onClick={handleLogout} className="btn-logout">Sair</button>
          </>
        ) : (
          <Link to="/login" className="btn-nav-novo">Entrar</Link>
        )}
      </div>
    </nav>
  );
}