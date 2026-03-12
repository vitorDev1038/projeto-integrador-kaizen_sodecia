// ... (mantenha os imports iguais)

export function Dashboard() {
  // ... (mantenha os estados iguais)

  async function carregarKaizens() {
    setLoading(true);
    // ADICIONADO: avatar_url no select
    const { data, error } = await supabase
      .from('kaizens')
      .select(`*, perfis (nome_completo, avatar_url)`) 
      .order('criado_em', { ascending: false });

    if (!error && data) {
      atualizarStats(data);
      setKaizens(data);
    }
    setLoading(false);
  }

  // ... (mantenha as outras funções iguais)

  return (
    <div className="dashboard-container">
      {/* ... estatísticas e filtros ... */}

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
                <td className="autor-col">
                  {/* ADICIONADO: Foto do autor na tabela */}
                  <div className="autor-info">
                    <img 
                      src={k.perfis?.avatar_url || 'https://via.placeholder.com/150'} 
                      alt="" 
                      className="table-avatar"
                    />
                    <span>{k.perfis?.nome_completo || '---'}</span>
                  </div>
                </td>
                <td><strong>{k.titulo}</strong></td>
                {/* ... restante da tabela ... */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* ... paginação ... */}
    </div>
  );
}