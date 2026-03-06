import { useState } from 'react';
import { supabase } from '../services/supabase'; 
import './NovoKaizen.css';

export function NovoKaizen() {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [solucao, setSolucao] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [foto, setFoto] = useState(null); // Estado para o arquivo

  async function handleSubmit(e) {
    e.preventDefault();
    if (enviando) return;

    setEnviando(true);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      alert("Sessão expirada.");
      setEnviando(false);
      return;
    }

    let fotoUrl = null;

    // Lógica de Upload da Foto
    if (foto) {
      const fileExt = foto.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${session.user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('kaizen-fotos')
        .upload(filePath, foto);

      if (!uploadError) {
        const { data } = supabase.storage.from('kaizen-fotos').getPublicUrl(filePath);
        fotoUrl = data.publicUrl;
      }
    }

    const { error } = await supabase
      .from('kaizens')
      .insert([{ 
        titulo, 
        descricao_problema: descricao, 
        solucao_proposta: solucao,
        status: 'pendente',
        autor_id: session.user.id,
        foto_antes: fotoUrl // Salvando a URL da foto
      }]);

    if (error) {
      alert("Erro ao salvar: " + error.message);
    } else {
      alert("Kaizen enviado com sucesso!");
      setTitulo(''); setDescricao(''); setSolucao(''); setFoto(null);
    }
    setEnviando(false);
  }

  return (
    <div className="form-container">
      <h2>Nova Sugestão Kaizen</h2>
      <form onSubmit={handleSubmit}>
        <label>Título da Ideia</label>
        <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} required />

        <label>Descrição do Problema</label>
        <textarea value={descricao} onChange={e => setDescricao(e.target.value)} required />

        <label>Foto da Situação Atual (Opcional)</label>
        <input type="file" accept="image/*" onChange={e => setFoto(e.target.files[0])} className="input-file" />

        <label>Solução Proposta</label>
        <textarea value={solucao} onChange={e => setSolucao(e.target.value)} required />

        <button type="submit" disabled={enviando}>
          {enviando ? 'Processando...' : 'Enviar Sugestão'}
        </button>
      </form>
    </div>
  );
}