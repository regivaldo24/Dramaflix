-- Execute este script no SQL Editor do seu projeto Supabase

-- 1. Tabela de Perfis de Usuários (vinculada à auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  coins INTEGER DEFAULT 0,
  bonus_coins INTEGER DEFAULT 0,
  is_vip BOOLEAN DEFAULT false,
  vip_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Row Level Security) na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para profiles
CREATE POLICY "Usuários podem ver seu próprio perfil" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Trigger para criar um perfil automaticamente quando um novo usuário se cadastrar
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. Tabela Opcional para Dramas (se quiser buscar do banco e não mockado)
CREATE TABLE IF NOT EXISTS public.dramas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  video_url TEXT,
  tag TEXT,
  pill TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.dramas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dramas são públicos para leitura" ON public.dramas FOR SELECT USING (true);


-- 3. Tabela de Minha Lista (dramas salvos pelo usuário)
CREATE TABLE IF NOT EXISTS public.my_list (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  drama_id UUID REFERENCES public.dramas(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, drama_id)
);
ALTER TABLE public.my_list ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem ver sua própria lista" ON public.my_list FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem adicionar na sua lista" ON public.my_list FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem remover da sua lista" ON public.my_list FOR DELETE USING (auth.uid() = user_id);


-- 4. Tabela de Histórico de Transações (Recargas, Desbloqueios e Bônus)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('recharge', 'unlock', 'bonus')),
  amount INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem ver suas próprias transações" ON public.transactions FOR SELECT USING (auth.uid() = user_id);


-- 5. Tabela de Comentários
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  drama_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comentários são públicos para leitura" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Usuários podem criar comentários" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem deletar seus próprios comentários" ON public.comments FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar seus próprios comentários" ON public.comments FOR UPDATE USING (auth.uid() = user_id);


-- 6. Tabela de Histórico de Visualização (Continuar Assistindo)
CREATE TABLE IF NOT EXISTS public.watch_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  drama_id TEXT NOT NULL,
  last_time FLOAT DEFAULT 0,
  duration FLOAT DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, drama_id)
);
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem ver seu próprio histórico" ON public.watch_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem salvar histórico" ON public.watch_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar histórico" ON public.watch_history FOR UPDATE USING (auth.uid() = user_id);
