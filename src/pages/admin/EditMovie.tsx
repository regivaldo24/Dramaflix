import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mockDramas } from '../../data/mockData';

export default function AdminEditMovie() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    video: '',
    capa: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Find movie in mock or custom
    const customDramasStr = localStorage.getItem('custom_dramas') || '[]';
    let customDramas = [];
    try {
      customDramas = JSON.parse(customDramasStr);
      if (!Array.isArray(customDramas)) customDramas = [];
    } catch {
      customDramas = [];
    }

    const allDramas = [...mockDramas, ...customDramas];
    const movie = allDramas.find(d => d.id.toString() === id);

    if (movie) {
      setFormData({
        titulo: movie.title,
        descricao: movie.description || '',
        video: movie.trailer || '',
        capa: movie.image
      });
    } else {
      alert("Filme não encontrado");
      navigate('/admin/filmes');
    }
    setLoading(false);
  }, [id, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const customDramasStr = localStorage.getItem('custom_dramas') || '[]';
    let customDramas: any[] = [];
    try {
      customDramas = JSON.parse(customDramasStr);
      if (!Array.isArray(customDramas)) customDramas = [];
    } catch {
      customDramas = [];
    }

    const isCustom = customDramas.some(d => d.id.toString() === id);

    if (isCustom) {
      // Update existing custom movie
      const updated = customDramas.map(d => {
        if (d.id.toString() === id) {
          return {
            ...d,
            title: formData.titulo,
            description: formData.descricao,
            trailer: formData.video,
            image: formData.capa
          };
        }
        return d;
      });
      try {
        localStorage.setItem('custom_dramas', JSON.stringify(updated));
      } catch (e) {}
    } else {
      // It's a mock movie. We can't really edit mockData.ts at runtime, 
      // but we can save an "override" or just push it to custom_dramas if we want it to "replace" the mock.
      // For this demo, let's treat it as a new custom entry or just alert that mock movies are readonly.
      // Better yet: Add an "overrides" logic or just say it's updated (simulated).
      
      // Let's implement an "overrides" system or just push to custom and mark the mock as hidden.
      // Simplest: Just inform that mock movies can't be edited in this demo.
      alert("Filmes de demonstração (mock) não podem ser editados permanentemente neste protótipo. Apenas filmes adicionados manualmente.");
      navigate('/admin/filmes');
      return;
    }

    alert("Filme atualizado!");
    navigate('/admin/filmes');
  };

  if (loading) return <div className="p-8 text-center text-neutral-400">Carregando...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Editar Filme</h1>
      
      <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800 p-8 rounded-lg space-y-6">
        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-2">Título</label>
          <input 
            type="text" 
            required
            className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-4 py-2 text-white focus:outline-none focus:border-red-500"
            value={formData.titulo}
            onChange={e => setFormData({...formData, titulo: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-2">Descrição</label>
          <textarea 
            rows={4}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-4 py-2 text-white focus:outline-none focus:border-red-500"
            value={formData.descricao}
            onChange={e => setFormData({...formData, descricao: e.target.value})}
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
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-2">URL da Capa (Imagem)</label>
          <input 
            type="text" 
            className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-4 py-2 text-white focus:outline-none focus:border-red-500"
            value={formData.capa}
            onChange={e => setFormData({...formData, capa: e.target.value})}
          />
        </div>

        <div className="flex gap-4">
          <button 
            type="button" 
            onClick={() => navigate('/admin/filmes')}
            className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 rounded-md transition-colors"
          >
            Cancelar
          </button>
          <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-md transition-colors">
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
}
