import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminAddMovie() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    video: '',
    capa: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulating database insert
    const customDramasStr = localStorage.getItem('custom_dramas') || '[]';
    let customDramas = [];
    try {
      customDramas = JSON.parse(customDramasStr);
      if (!Array.isArray(customDramas)) customDramas = [];
    } catch {
      customDramas = [];
    }

    const novoFilme = {
      id: `custom_${Date.now()}`,
      title: formData.titulo,
      description: formData.descricao,
      trailer: formData.video,
      image: formData.capa || 'https://images.unsplash.com/photo-1540224871915-c21d8b7ea844?auto=format&fit=crop&q=80&w=400', // default cover
      pill: "Novo",
      tag: "Drama",
      duration: 120,
    };

    customDramas.push(novoFilme);
    try {
      localStorage.setItem('custom_dramas', JSON.stringify(customDramas));
    } catch (e) {}
    
    alert("Filme cadastrado!");
    navigate('/admin/filmes');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Adicionar Filme</h1>
      
      <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800 p-8 rounded-lg space-y-6">
        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-2">Título</label>
          <input 
            type="text" 
            required
            className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-4 py-2 text-white focus:outline-none focus:border-red-500"
            value={formData.titulo}
            onChange={e => setFormData({...formData, titulo: e.target.value})}
            placeholder="Ex: A Vingança da Herdeira"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-2">Descrição</label>
          <textarea 
            rows={4}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-4 py-2 text-white focus:outline-none focus:border-red-500"
            value={formData.descricao}
            onChange={e => setFormData({...formData, descricao: e.target.value})}
            placeholder="Breve sinopse do filme..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-2">URL HLS (.m3u8) / MP4</label>
          <input 
            type="text" 
            required
            className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-4 py-2 text-white focus:outline-none focus:border-red-500"
            value={formData.video}
            onChange={e => setFormData({...formData, video: e.target.value})}
            placeholder="Ex: https://www.w3schools.com/html/mov_bbb.mp4"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-2">URL da Capa (Imagem)</label>
          <input 
            type="text" 
            className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-4 py-2 text-white focus:outline-none focus:border-red-500"
            value={formData.capa}
            onChange={e => setFormData({...formData, capa: e.target.value})}
            placeholder="Ex: https://..."
          />
          <p className="text-xs text-neutral-500 mt-1">Neste mock usamos URL de imagem em vez de upload de arquivo.</p>
        </div>

        <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-md transition-colors">
          Salvar
        </button>
      </form>
    </div>
  );
}
