import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockDramas } from '../../data/mockData';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Users, Film, DollarSign, Eye, Crown, CreditCard, TrendingUp, AlertCircle, ArrowUpRight, ArrowDownRight, Headset } from 'lucide-react';

const COLORS = ['#ef4444', '#3b82f6', '#eab308', '#22c55e', '#a855f7'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [totalUsers, setTotalUsers] = useState(0);
  const [vipUsers, setVipUsers] = useState(0);
  const [totalFilmes, setTotalFilmes] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [totalReceita, setTotalReceita] = useState(0);
  const [activeChats, setActiveChats] = useState(0);
  const [planDistribution, setPlanDistribution] = useState<any[]>([]);
  const [recentSubs, setRecentSubs] = useState<any[]>([]);
  const [periodoViews, setPeriodoViews] = useState('7');

  useEffect(() => {
    // Fetch active chats
    fetch('/api/admin/chat-sessions')
      .then(res => res.json())
      .then(data => setActiveChats(data.length));

    // Fetch and process real user data
    let usersStr = null;
    try {
      usersStr = localStorage.getItem('users');
    } catch (e) {}
    
    try {
      const users = JSON.parse(usersStr || '[]');
      if (!Array.isArray(users)) {
        setTotalUsers(0);
        return;
      }
      setTotalUsers(users.length);
      
      const vips = users.filter((u: any) => u.plano?.includes('Ouro') || u.plano?.includes('Prata'));
      setVipUsers(vips.length);

      // Plan Distribution for Pie Chart
      const dist = {
        'Gratuito': 0,
        'Bronze (VIP)': 0,
        'Prata (VIP)': 0,
        'Ouro (VIP)': 0
      };
      users.forEach((u: any) => {
        const p = u?.plano || 'Gratuito';
        const cleanPlan = p.includes('Ouro') ? 'Ouro (VIP)' : p.includes('Prata') ? 'Prata (VIP)' : p.includes('Bronze') ? 'Bronze (VIP)' : 'Gratuito';
        if (dist[cleanPlan as keyof typeof dist] !== undefined) {
          dist[cleanPlan as keyof typeof dist]++;
        }
      });
      setPlanDistribution([
        { name: 'Gratuito', value: dist['Gratuito'] },
        { name: 'Bronze (VIP)', value: dist['Bronze (VIP)'] },
        { name: 'Prata (VIP)', value: dist['Prata (VIP)'] },
        { name: 'Ouro (VIP)', value: dist['Ouro (VIP)'] },
      ].filter(d => d.value > 0));

      // Recent subscriptions
      const vipsWithDates = users.filter((u: any) => u.mp_subscription_id)
        .sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, 5);
      setRecentSubs(vipsWithDates);

      // Simulated Revenue based on active plans
      // In a real app, this comes from a monthly history table
      const revenue = users.reduce((acc: number, u: any) => {
        const p = u.plano || '';
        if (p.includes('Bronze')) return acc + 29.90;
        if (p.includes('Prata')) return acc + 59.90;
        if (p.includes('Ouro')) return acc + 499.90;
        return acc;
      }, 0);
      setTotalReceita(revenue);

    } catch (e) {
      console.error(e);
      setTotalUsers(0);
    }

    // Movies
    let customDramasStr = null;
    try {
      customDramasStr = localStorage.getItem('custom_dramas');
    } catch (e) {}

    try {
      const customDramas = JSON.parse(customDramasStr || '[]');
      const customArray = Array.isArray(customDramas) ? customDramas : [];
      setTotalFilmes(mockDramas.length + customArray.length);
    } catch {
      setTotalFilmes(mockDramas.length);
    }

    // Views
    let viewsCount = 0;
    try {
      // Fix: local storage length can change if this is called while cleaning up or something
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        keys.push(localStorage.key(i));
      }

      for (const key of keys) {
          if (key && key.startsWith('views_')) {
            const data = localStorage.getItem(key);
            if (data) {
              const views = JSON.parse(data);
              if (Array.isArray(views)) {
                viewsCount += views.length;
              }
            }
          }
      }
    } catch (e) {
      console.error("Error calculating views", e);
    }
    setTotalViews(viewsCount);
  }, [navigate]);

  return (
    <div className="pb-20">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Executivo</h1>
          <p className="text-neutral-500 text-sm mt-1">Visão geral do desempenho da plataforma.</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-1 flex gap-1">
          <button className="px-3 py-1.5 text-xs font-bold bg-neutral-800 text-white rounded">HOJE</button>
          <button className="px-3 py-1.5 text-xs font-bold text-neutral-500 hover:text-white rounded transition-colors">ESTE MÊS</button>
        </div>
      </div>
      
      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard 
          icon={Users} 
          label="Total Usuários" 
          value={totalUsers} 
          color="blue" 
          trend="+12%" 
          onClick={() => navigate('/admin/usuarios')}
        />
        <StatCard 
          icon={Headset} 
          label="Chat Ativo" 
          value={activeChats} 
          color="red" 
          trend={activeChats > 0 ? "Novo" : ""}
          onClick={() => navigate('/admin/chat')}
        />
        <StatCard 
          icon={Crown} 
          label="Vips" 
          value={vipUsers} 
          color="yellow" 
          trend="+5%" 
          onClick={() => navigate('/admin/usuarios')}
        />
        <StatCard 
          icon={Eye} 
          label="Daily Views" 
          value={totalViews} 
          color="purple" 
          trend="-2%" 
        />
        <StatCard 
          icon={DollarSign} 
          label="MRR (Receita)" 
          value={`R$ ${totalReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          color="green" 
          trend="+18%" 
          onClick={() => navigate('/admin/planos')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfico de Distribuição de Planos */}
        <div className="bg-[#1a1a1a] p-6 rounded-2xl shadow-2xl border border-neutral-800/50 lg:col-span-1">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-red-500" /> Distribuição de Planos
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {planDistribution.map((d, i) => (
              <div key={d.name} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-neutral-400">{d.name}</span>
                </div>
                <span className="font-bold text-white">{d.value} ({totalUsers > 0 ? Math.round(d.value / totalUsers * 100) : 0}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Assinaturas Recentes */}
        <div className="bg-[#1a1a1a] p-6 rounded-2xl shadow-2xl border border-neutral-800/50 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-green-500" /> Assinaturas Recentes
            </h3>
            <button 
              onClick={() => navigate('/admin/usuarios')}
              className="text-xs font-bold text-neutral-500 hover:text-white uppercase tracking-wider"
            >
              Ver Todas
            </button>
          </div>
          <div className="space-y-4">
            {recentSubs.length > 0 ? recentSubs.map((sub, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-neutral-900/50 rounded-xl border border-neutral-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center font-bold text-neutral-400">
                    {sub.name?.charAt(0) || sub.email?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{sub.email}</p>
                    <p className="text-[10px] text-neutral-500 uppercase font-black">{sub.plano} • ID: {sub.mp_subscription_id?.slice(-8)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-500">+ R$ {sub.plano?.includes('Ouro') ? '499,90' : sub.plano?.includes('Prata') ? '59,90' : '29,90'}</p>
                  <p className="text-[10px] text-neutral-600 font-medium">há poucos minutos</p>
                </div>
              </div>
            )) : (
              <div className="py-20 text-center text-neutral-600">
                <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p className="text-sm font-medium">Nenhuma assinatura recente encontrada.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, trend, onClick }: any) {
  const colorMap = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    green: 'text-green-500 bg-green-500/10 border-green-500/20',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    yellow: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    red: 'text-red-500 bg-red-500/10 border-red-500/20',
  };

  const isPositive = trend?.startsWith('+');

  return (
    <div 
      onClick={onClick}
      className={`p-6 rounded-2xl shadow-xl border border-neutral-800/50 bg-[#1a1a1a] group transition-all ${onClick ? 'cursor-pointer hover:border-neutral-700 hover:scale-[1.02]' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${colorMap[color as keyof typeof colorMap]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={`flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded ${isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
            {isPositive ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
            {trend}
          </div>
        )}
      </div>
      <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black text-white mt-1">{value}</p>
    </div>
  );
}
