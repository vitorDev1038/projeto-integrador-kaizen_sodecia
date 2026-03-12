import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import './ModalPerfil.css';

export function ModalPerfil({ isOpen, onClose, perfil, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome_completo: '',
    cpf: '',
    cidade: '',
    endereco: '',
    avatar_url: ''
  });

  useEffect(() => {
    if (perfil) setFormData(perfil);
  }, [perfil]);

  const handleUpload = async (e) => {
    try {
      setLoading(true);
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${perfil.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Sobe a foto para o Bucket 'avatars'
      let { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Pega a URL pública
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      setFormData({ ...formData, avatar_url: data.publicUrl });
    } catch (error) {
      alert('Erro ao subir foto: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase
      .from('perfis')
      .update(formData)
      .eq('id', perfil.id);

    if (!error) {
      onUpdate(formData);
      onClose();
      alert('Perfil atualizado com sucesso!');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Editar Meu Perfil</h2>
        <form onSubmit={handleSave}>
          <div className="avatar-upload">
            <img src={formData.avatar_url || 'https://via.placeholder.com/150'} alt="Avatar" />
            <input type="file" accept="image/*" onChange={handleUpload} disabled={loading} />
          </div>

          <label>Nome Completo</label>
          <input type="text" value={formData.nome_completo} onChange={e => setFormData({...formData, nome_completo: e.target.value})} required />

          <label>CPF</label>
          <input type="text" value={formData.cpf || ''} onChange={e => setFormData({...formData, cpf: e.target.value})} placeholder="000.000.000-00" />

          <label>Cidade</label>
          <input type="text" value={formData.cidade || ''} onChange={e => setFormData({...formData, cidade: e.target.value})} />

          <label>Endereço</label>
          <input type="text" value={formData.endereco || ''} onChange={e => setFormData({...formData, endereco: e.target.value})} />

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancelar">Cancelar</button>
            <button type="submit" className="btn-salvar" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}