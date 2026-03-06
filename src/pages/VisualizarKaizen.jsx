import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import './VisualizarKaizen.css';

export function VisualizarKaizen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [kaizen, setKaizen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fotoDepois, setFotoDepois] = useState(null);
  const [concluindo, setConcluindo] = useState(false);

  useEffect(() => {
    async function carregarDados() {
      try {
        const { data, error } = await supabase
          .from('kaizens')
          .select(`
            *,
            perfis (
              nome_completo
            )
          `)
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          alert("Kaizen não encontrado.");
          navigate('/dashboard');
          return;
        }

        setKaizen(data);
      } catch (err) {
        console.error("Erro ao carregar:", err.message);
        alert("Erro técnico ao buscar Kaizen.");
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, [id, navigate]);

  async function handleFinalizarKaizen(e) {
    e.preventDefault();
    if (!fotoDepois) return alert("Selecione a foto do Depois.");
    setConcluindo(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const fileExt = fotoDepois.name.split('.').pop();
      const fileName = `depois-${id}-${Date.now()}.${fileExt}`;
      const filePath = fileName; 

      const { error: uploadError } = await supabase.storage
        .from('kaizen-fotos')
        .upload(filePath, fotoDepois);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('kaizen-fotos')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('kaizens')
        .update({ 
          status: 'concluido',
          foto_depois: publicUrl,
          admin_concluiu_id: session.user.id
        })
        .eq('id', id);

      if (updateError) throw updateError;

      alert("Kaizen finalizado com sucesso!");
      navigate('/dashboard');
    } catch (error) {
      alert("Erro ao finalizar: " + error.message);
    } finally {
      setConcluindo(false);
    }
  }

  if (loading) return <div className="loading-container">Carregando detalhes...</div>;

  return (
    <div className="view-container">
      <header className="view-header">
        <button className="btn-voltar" onClick={() => navigate('/dashboard')}>⬅ Voltar</button>
        <h2>Detalhes da Melhoria</h2>
      </header>

      <div className="kaizen-details-card">
        <div className="card-header">
          <h3>{kaizen.titulo}</h3>
          <span className={`status-tag ${kaizen.status || 'pendente'}`}>
            {kaizen.status || 'pendente'}
          </span>
        </div>
        
        <p className="autor-info"><strong>Colaborador:</strong> {kaizen.perfis?.nome_completo || 'Sem Nome'}</p>
        
        <div className="comparativo-fotos">
          <div className="foto-box">
            <h4>SITUAÇÃO ANTES</h4>
            {kaizen.foto_antes ? (
              <img src={kaizen.foto_antes} alt="Antes" className="img-kaizen" />
            ) : <div className="no-image">Sem foto</div>}
          </div>

          <div className="foto-box">
            <h4>SITUAÇÃO DEPOIS</h4>
            {kaizen.foto_depois ? (
              <img src={kaizen.foto_depois} alt="Depois" className="img-kaizen" />
            ) : (
              <div className="no-image awaiting">Aguardando Conclusão...</div>
            )}
          </div>
        </div>

        <div className="texto-detalhe">
          <h4>O Problema identificado:</h4>
          <p>{kaizen.descricao_problema}</p>
        </div>

        <div className="texto-detalhe">
          <h4>A Solução aplicada:</h4>
          <p>{kaizen.solucao_proposta}</p>
        </div>
      </div>

      {kaizen.status !== 'concluido' && (
        <form onSubmit={handleFinalizarKaizen} className="form-concluir-admin">
          <h3>Finalizar Implementação</h3>
          <p>Tire uma foto do local/processo após a melhoria ter sido feita.</p>
          
          <div className="file-upload-wrapper">
            <label htmlFor="foto-depois" className="custom-file-upload">
              {fotoDepois ? "✅ Foto Selecionada" : "📸 Abrir Câmera / Galeria"}
            </label>
            <input 
              id="foto-depois"
              type="file" 
              accept="image/*" 
              capture="camera"
              onChange={e => setFotoDepois(e.target.files[0])} 
              required
            />
            {fotoDepois && <span className="file-name-display">{fotoDepois.name}</span>}
          </div>

          <button type="submit" disabled={concluindo} className="btn-concluir">
            {concluindo ? 'Enviando...' : 'Confirmar e Concluir Kaizen'}
          </button>
        </form>
      )}
    </div>
  );
}