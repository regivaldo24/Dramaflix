import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockDramas } from '../../data/mockData';
import { Plus, Edit, Trash2 } from 'lucide-react';
import AdminConfirmationModal from '../../components/AdminComponents/AdminConfirmationModal';

export default function AdminMovies() {
  const [filmes, setFilmes] = useState<any[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState<any>(null);
  const navigate = useNavigate();

  const loadFilmes = () => {
    const customDramasStr = localStorage.getItem('custom_dramas') || '[]';
    let customDramas = [];
    try {
      customDramas = JSON.parse(customDramasStr);
      if (!Array.isArray(customDramas)) customDramas = [];
    } catch {
      customDramas = [];
    }
    
    setFilmes([...mockDramas, ...customDramas]);
  };

  useEffect(() => {
    loadFilmes();
  }, []);

  const handleDelete = (movie: any) => {
    setMovieToDelete(movie);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!movieToDelete) return;
    
    const id = movieToDelete.id;
    const customDramasStr = localStorage.getItem('custom_dramas') || '[]';
    try {
      let customDramas = JSON.parse(customDramasStr);
      if (!Array.isArray(customDramas)) customDramas = [];
      const filtered = customDramas.filter((d: any) => d.id !== id);
      
      if (filtered.length !== customDramas.length) {
        try {
      localStorage.setItem('custom_dramas', JSON.stringify(filtered));
    } catch (e) {}
        loadFilmes();
        setIsDeleteModalOpen(false);
        setMovieToDelete(null);
      } else {
        alert("Não é possível excluir filmes mockados de demonstração.");
        setIsDeleteModalOpen(false);
        setMovieToDelete(null);
      }
    } catch {
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Filmes</h1>
        <Link to="/admin/add_filme" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2">
          <Plus className="w-5 h-5" /> Adicionar Filme
        </Link>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400">
            <tr>
              <th className="p-4 font-medium">Capa</th>
              <th className="p-4 font-medium">Título</th>
              <th className="p-4 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {filmes.map(f => (
              <tr key={f.id} className="hover:bg-neutral-800/50">
                <td className="p-4 w-24">
                  <img src={f.image} alt={f.title} className="w-16 h-10 object-cover rounded" />
                </td>
                <td className="p-4 font-medium">{f.title}</td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => navigate(`/admin/edit_filme/${f.id}`)}
                      className="text-blue-500 hover:text-blue-400" 
                      title="Editar"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(f)} 
                      className="text-red-500 hover:text-red-400"
                      title="Excluir"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Excluir Filme?"
        message="Tem certeza que deseja apagar este conteúdo? Esta ação removerá o título da listagem administrativa."
        itemName={movieToDelete?.title}
        confirmText="Confirmar Exclusão"
      />
    </div>
  );
}
