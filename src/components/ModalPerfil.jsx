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

  // --- LÓGICA DA MÁSCARA DE CPF ---
  const handleCPFChange = (e) => {
    let value = e.target.value;
    
    // Remove tudo o que não é dígito
    value = value.replace(/\D/g, "");

    // Limita a 11 números
    if (value.length > 11) value = value.slice(0, 11);

    // Aplica a formatação 000.000.000-00
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

    setFormData({ ...formData, cpf: value });
  };

  const handleUpload = async (e) => {
    try {
      setLoading(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${perfil.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      let { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

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

    // Validação de tamanho do CPF (14 caracteres contando pontos e traço)
    if (formData.cpf && formData.cpf.length > 0 && formData.cpf.length < 14) {
      alert("Por favor, preencha o CPF completo.");
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('perfis')
      .update(formData)
      .eq('id', perfil.id);

    if (!error) {
      onUpdate(formData);
      onClose();
      alert('Perfil atualizado com sucesso!');
    } else {
      alert('Erro ao salvar: ' + error.message);
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
            <label htmlFor="file-input" style={{ cursor: 'pointer' }}>
              <img 
                src={formData.avatar_url || 'https://via.placeholder.com/150'} 
                alt="Avatar" 
                title="Clique para mudar a foto"
              />
            </label>
            <input 
              id="file-input"
              type="file" 
              accept="image/*" 
              onChange={handleUpload} 
              disabled={loading}
              style={{ display: 'none' }} // Esconde o botão feio do sistema
            />
            <small>Clique na imagem para trocar</small>
          </div>

          <label>Nome Completo</label>
          <input 
            type="text" 
            value={formData.nome_completo} 
            onChange={e => setFormData({...formData, nome_completo: e.target.value})} 
            required 
          />

          <label>CPF</label>
          <input 
            type="text" 
            value={formData.cpf || ''} 
            onChange={handleCPFChange} 
            placeholder="000.000.000-00"
            maxLength="14"
          />

          <label>Cidade</label>
          <input 
            type="text" 
            value={formData.cidade || ''} 
            onChange={e => setFormData({...formData, cidade: e.target.value})} 
          />

          <label>Endereço</label>
          <input 
            type="text" 
            value={formData.endereco || ''} 
            onChange={e => setFormData({...formData, endereco: e.target.value})} 
          />

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancelar">Cancelar</button>
            <button type="submit" className="btn-salvar" disabled={loading}>
              {loading ? 'Processando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}