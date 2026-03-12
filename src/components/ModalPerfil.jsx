import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import './ModalPerfil.css';

export function ModalPerfil({ isOpen, onClose, perfil, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome_completo: '',
    cpf: '',
    cep: '',
    cidade: '',
    bairro: '',
    endereco: '',
    avatar_url: ''
  });

  useEffect(() => {
    if (perfil) setFormData(perfil);
  }, [perfil]);

  // --- LÓGICA DA BARRA DE PROGRESSO ---
  const camposParaVerificar = [
    formData.nome_completo,
    formData.cpf,
    formData.cep,
    formData.cidade,
    formData.avatar_url,
    formData.bairro,
    formData.endereco
  ];
  const preenchidos = camposParaVerificar.filter(c => c && c.length > 5).length; 
  const progresso = Math.round((preenchidos / camposParaVerificar.length) * 100);

  const handleCEPChange = async (e) => {
    let cep = e.target.value.replace(/\D/g, "");
    if (cep.length > 8) cep = cep.slice(0, 8);
    const maskedCEP = cep.replace(/^(\d{5})(\d)/, "$1-$2");
    setFormData(prev => ({ ...prev, cep: maskedCEP }));

    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            cidade: `${data.localidade} - ${data.uf}`,
            bairro: data.bairro,
            endereco: data.logradouro
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar CEP");
      }
    }
  };

  const handleCPFChange = (e) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 11);
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
      await supabase.storage.from('avatars').upload(filePath, file);
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setFormData({ ...formData, avatar_url: data.publicUrl });
    } catch (error) {
      alert('Erro ao subir foto');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('perfis').update(formData).eq('id', perfil.id);
    if (!error) {
      onUpdate(formData);
      onClose();
      alert('Perfil atualizado com sucesso! 🎉');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>👤 Editar Meu Perfil</h2>

        {/* BARRA DE PROGRESSO */}
        <div className="progress-wrapper">
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${progresso}%` }}></div>
          </div>
          <small>{progresso}% do perfil preenchido</small>
        </div>

        <form onSubmit={handleSave}>
          <div className="avatar-upload">
            <label htmlFor="file-input">
              <img src={formData.avatar_url || 'https://via.placeholder.com/150'} alt="Avatar" />
              <div className="camera-badge">📸</div>
            </label>
            <input id="file-input" type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
          </div>

          <label>📝 Nome Completo</label>
          <input type="text" value={formData.nome_completo} onChange={e => setFormData({...formData, nome_completo: e.target.value})} required />

          <div className="form-row">
            <div>
              <label>💳 CPF</label>
              <input type="text" value={formData.cpf || ''} onChange={handleCPFChange} maxLength="14" placeholder="000.000.000-00" />
            </div>
            <div>
              <label>🔢 CEP</label>
              <input type="text" value={formData.cep || ''} onChange={handleCEPChange} placeholder="00000-000" />
            </div>
          </div>

          <label>🏙️ Cidade</label>
          <input type="text" value={formData.cidade || ''} readOnly className="input-readonly" />

          <label>🏘️ Bairro</label>
          <input type="text" value={formData.bairro || ''} onChange={e => setFormData({...formData, bairro: e.target.value})} />

          <label>📍 Rua / Logradouro</label>
          <input type="text" value={formData.endereco || ''} onChange={e => setFormData({...formData, endereco: e.target.value})} />

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancelar">Sair</button>
            <button type="submit" className="btn-salvar" disabled={loading}>
              {loading ? 'Salvando...' : '💾 Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}