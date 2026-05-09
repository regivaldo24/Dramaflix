import React, { useState, useEffect } from 'react';
import { Edit, Save, X, Plus, Trash2 } from 'lucide-react';

interface Plan {
  id: string;
  title: string;
  price: string;
  limit: string;
  features: string[];
}

const DEFAULT_PLANS: Plan[] = [
  { id: 'bronze', title: 'Bronze', price: '29,90', limit: 'baixo', features: ['Acesso limitado', 'Anúncios', 'SD Quality'] },
  { id: 'prata', title: 'Prata', price: '59,90', limit: 'médio', features: ['Acesso intermediário', 'Sem anúncios', 'HD Quality'] },
  { id: 'ouro', title: 'Ouro', price: '499,90', limit: 'ilimitado', features: ['Acesso total', 'Sem anúncios', '4K Quality', 'Downloads offline'] },
];

export default function AdminPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Plan | null>(null);

  useEffect(() => {
    let savedPlans = null;
    try {
      savedPlans = localStorage.getItem('site_plans');
    } catch (e) {}

    if (savedPlans) {
      try {
        const parsed = JSON.parse(savedPlans);
        setPlans(Array.isArray(parsed) ? parsed : DEFAULT_PLANS);
      } catch (e) {
        setPlans(DEFAULT_PLANS);
      }
    } else {
      setPlans(DEFAULT_PLANS);
      try {
        localStorage.setItem('site_plans', JSON.stringify(DEFAULT_PLANS));
      } catch (e) {}
    }
  }, []);

  const handleEdit = (plan: Plan) => {
    setEditingId(plan.id);
    setEditForm({ ...plan, features: [...plan.features] });
  };

  const handleSave = () => {
    if (!editForm) return;
    const updatedPlans = plans.map(p => p.id === editForm.id ? editForm : p);
    setPlans(updatedPlans);
    try {
      localStorage.setItem('site_plans', JSON.stringify(updatedPlans));
    } catch (e) {}
    setEditingId(null);
    setEditForm(null);
    alert('Plano atualizado com sucesso!');
  };

  const handleFeatureChange = (index: number, value: string) => {
    if (!editForm) return;
    const newFeatures = [...editForm.features];
    newFeatures[index] = value;
    setEditForm({ ...editForm, features: newFeatures });
  };

  const addFeature = () => {
    if (!editForm) return;
    setEditForm({ ...editForm, features: [...editForm.features, 'Nova característica'] });
  };

  const removeFeature = (index: number) => {
    if (!editForm) return;
    const newFeatures = editForm.features.filter((_, i) => i !== index);
    setEditForm({ ...editForm, features: newFeatures });
  };

  return (
    <div className="pb-20">
      <h1 className="text-3xl font-bold mb-8">Gerenciar Planos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl flex flex-col shadow-lg">
            {editingId === plan.id && editForm ? (
              <div className="space-y-4 flex-1">
                <div>
                  <label className="block text-xs text-neutral-500 uppercase font-bold mb-1">Título</label>
                  <input 
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-white focus:border-red-500 outline-none"
                    value={editForm.title}
                    onChange={e => setEditForm({...editForm, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 uppercase font-bold mb-1">Preço (R$)</label>
                  <input 
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-white focus:border-red-500 outline-none"
                    value={editForm.price}
                    onChange={e => setEditForm({...editForm, price: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 uppercase font-bold mb-1">Limite</label>
                  <input 
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-white focus:border-red-500 outline-none"
                    value={editForm.limit}
                    onChange={e => setEditForm({...editForm, limit: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 uppercase font-bold mb-2">Vantagens</label>
                  <div className="space-y-2">
                    {editForm.features.map((feature, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input 
                          className="flex-1 bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-sm text-white outline-none"
                          value={feature}
                          onChange={e => handleFeatureChange(idx, e.target.value)}
                        />
                        <button onClick={() => removeFeature(idx)} className="text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                    <button onClick={addFeature} className="text-xs text-blue-500 flex items-center gap-1 mt-1"><Plus className="w-3 h-3" /> Add Vantagem</button>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <button onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" /> Salvar
                  </button>
                  <button onClick={() => setEditingId(null)} className="px-4 bg-neutral-800 hover:bg-neutral-700 text-white rounded">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-1 text-red-500">{plan.title}</h2>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-sm text-neutral-400">R$</span>
                  <span className="text-3xl font-black text-white">{plan.price}</span>
                </div>
                
                <p className="text-neutral-400 mb-6 text-sm italic">Limite <span className="font-bold text-neutral-200">{plan.limit}</span></p>
                
                <ul className="space-y-3 flex-1 mb-6">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start text-neutral-300 text-sm">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 mt-1.5 shrink-0"></span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => handleEdit(plan)}
                  className="w-full border border-neutral-700 hover:border-red-500 text-white font-medium py-2 rounded transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" /> Editar Plano
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
