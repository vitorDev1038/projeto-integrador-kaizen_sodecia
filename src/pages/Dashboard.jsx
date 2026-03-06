import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate, Link } from 'react-router-dom';
import './Dashboard.css';

export function Dashboard() {
  const [kaizens, setKaizens] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pendentes: 0, concluidos: 0 });

  const navigate = useNavigate();

  useEffect(() => {
    async function verificarAcesso() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return navigate('/login');

        const { data: perfil } = await supabase
          .from('perfis')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();

        if (!perfil?.is_admin) {
          navigate('/novo');
          return;
        }

        await carregarKaizens();
      } catch (err) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    }
    verificarAcesso();
  }, [navigate]);

  async function carregarKaizens() {
    setLoading(true);
    const { data, error } = await supabase
      .from('kaizens')
      .select(`*, perfis (nome_completo)`)
      .order('criado_em', { ascending: false });

    if (!error && data) {
      atualizarStats(data);
      setKaizens(data);
    }
    setLoading(false);
  }

  function atualizarStats(lista) {
    setStats({
      total: lista.length,
      pendentes: lista.filter(k => (k.status || 'pendente') === 'pendente').length,
      concluidos: lista.filter(k => k.status === 'concluido').length
    });
  }

  async function excluirKaizen(id, titulo) {
    if (window.confirm(`Excluir permanentemente: "${titulo}"?`)) {
      await supabase.from('kaizens').delete().eq('id', id);
      carregarKaizens();
    }
  }

  const kaizensExibidos = kaizens.filter(k => {
    if (filtro === 'todos') return true;
    return (k.status || 'pendente') === filtro;
  });

  if (loading) return <div className="loading-container">Carregando painel Sodecia...</div>;

  return (
    <div className="dashboard-container">
      <header className="dash-header">
        <h1>Painel de Melhorias Kaizen</h1>
        <button onClick={carregarKaizens} className="btn-atualizar">🔄 Atualizar</button>
      </header>

      <div className="stats-grid">
        <div className="stat-card"><span>Total</span><h2>{stats.total}</h2></div>
        <div className="stat-card pendentes"><span>Pendentes</span><h2>{stats.pendentes}</h2></div>
        <div className="stat-card concluidos"><span>Implementadas</span><h2>{stats.concluidos}</h2></div>
      </div>

      <div className="filter-bar">
        {['todos', 'pendente', 'concluido'].map(f => (
          <button 
            key={f}
            className={filtro === f ? 'active' : ''} 
            onClick={() => setFiltro(f)}
          >
            {f === 'todos' ? 'Todos' : f === 'pendente' ? 'Pendentes' : 'Concluídos'}
          </button>
        ))}
      </div>

      <div className="table-responsive">
        <table className="kaizen-table">
          <thead>
            <tr>
              <th>Autor</th>
              <th>Título</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {kaizensExibidos.map((k) => (
              <tr key={k.id}>
                <td>{k.perfis?.nome_completo || '---'}</td>
                <td><strong>{k.titulo}</strong></td>
                <td>
                  <span className={`status-tag ${k.status || 'pendente'}`}>
                    {(k.status || 'pendente')}
                  </span>
                </td>
                <td>
                  <div className="acoes-area">
                    {/* O Olho agora é o link principal para ver e gerenciar */}
                    <Link to={`/kaizen/${k.id}`} className="btn-acao-link" title="Ver Detalhes">
                      {k.status === 'concluido' ? '👁️' : '✅'}
                    </Link>

                    <button className="btn-delete" onClick={() => excluirKaizen(k.id, k.titulo)}>
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}