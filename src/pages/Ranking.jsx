import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import './Ranking.css';

export function Ranking() {
  const [lideres, setLideres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function buscarRanking() {
      setLoading(true);
      
      // Buscamos todos os perfis e TODOS os kaizens de uma vez
      // O Supabase entende 'kaizens(status)' se houver a FK
      const { data, error } = await supabase
        .from('perfis')
        .select(`
          nome_completo,
          kaizens (
            status
          )
        `);

      if (error) {
        console.error("Erro no ranking:", error.message);
      } else if (data) {
        // Agora filtramos e contamos aqui no Front-end
        const listaFormatada = data
          .map(p => ({
            nome: p.nome_completo,
            // Conta quantos kaizens esse perfil tem com status 'concluido'
            total: p.kaizens ? p.kaizens.filter(k => k.status === 'concluido').length : 0
          }))
          // Remove quem tem 0 ideias para o ranking ficar limpo
          .filter(item => item.total > 0)
          // Ordena do maior para o menor
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
            <div key={index} className={`ranking-item rank-${index + 1}`}>
              <span className="posicao">{index + 1}º</span>
              <div className="avatar-simulado">{user.nome.charAt(0)}</div>
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