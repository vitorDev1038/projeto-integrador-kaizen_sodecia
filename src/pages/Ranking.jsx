import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import './Ranking.css';

export function Ranking() {
  const [lideres, setLideres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function buscarRanking() {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('perfis')
        .select(`
          id,
          nome_completo,
          avatar_url,
          kaizens (
            status
          )
        `);

      if (error) {
        console.error("Erro no ranking:", error.message);
      } else if (data) {
        const listaFormatada = data
          .map(p => ({
            id: p.id,
            nome: p.nome_completo,
            foto: p.avatar_url,
            total: p.kaizens ? p.kaizens.filter(k => k.status === 'concluido').length : 0
          }))
          .filter(item => item.total > 0)
          .sort((a, b) => b.total - a.total);

        setLideres(listaFormatada);
      }
      setLoading(false);
    }
    
    buscarRanking();
  }, []);

  if (loading) return <div className="loading-container">Calculando produtividade...</div>;

  return (
    <div className="ranking-container">
      <header className="ranking-header">
        <h1>🏆 Hall da Fama Kaizen</h1>
        <p>Colaboradores que mais transformam a SODECIA</p>
      </header>

      <div className="ranking-card">
        {lideres.length > 0 ? (
          lideres.map((user, index) => (
            <div key={user.id} className={`ranking-item rank-${index + 1}`}>
              <span className="posicao">{index + 1}º</span>
              
              {/* Substituído avatar-simulado pela foto real ou DiceBear */}
              <img 
                src={user.foto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                alt={user.nome} 
                className="ranking-avatar"
              />

              <span className="nome">{user.nome}</span>
              <span className="pontos"><strong>{user.total}</strong> {user.total === 1 ? 'Ideia' : 'Ideias'}</span>
              <span className="medalha">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''}
              </span>
            </div>
          ))
        ) : (
          <div className="ranking-vazio">
            <p>Ainda não temos ideias concluídas.</p>
            <p className="sub-vazio">As ideias aprovadas na Dashboard aparecerão aqui!</p>
          </div>
        )}
      </div>
    </div>
  );
}