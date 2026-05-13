import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, Trash2, User as UserIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
}

interface CommentsProps {
  dramaId: string;
}

export default function Comments({ dramaId }: CommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles:user_id(full_name, avatar_url)')
        .eq('drama_id', dramaId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();

    // Subscribe to changes
    const channel = supabase
      .channel(`comments:${dramaId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'comments',
        filter: `drama_id=eq.${dramaId}`
      }, () => {
        fetchComments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dramaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert([
          { 
            user_id: user.id, 
            drama_id: dramaId, 
            content: newComment.trim() 
          }
        ]);

      if (error) throw error;
      setNewComment('');
    } catch (err) {
      console.error('Error posting comment:', err);
      alert('Erro ao postar comentário. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir seu comentário?')) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Erro ao excluir comentário.');
    }
  };

  return (
    <div className="mt-12 mb-20 px-4 md:px-0">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-6 h-6 text-yellow-500" />
        <h2 className="text-xl font-black text-white">Comentários ({comments.length})</h2>
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-10 group">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-neutral-800 border-2 border-yellow-500/20 flex items-center justify-center overflow-hidden">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-5 h-5 text-neutral-500" />
                )}
              </div>
            </div>
            <div className="flex-grow space-y-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="O que você achou deste drama?"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-white placeholder-neutral-600 focus:outline-none focus:border-yellow-500/50 transition-all resize-none h-24 text-sm"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:hover:bg-yellow-500 text-black font-bold py-2 px-6 rounded-full text-sm transition-all flex items-center gap-2 active:scale-95"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Comentar
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center mb-10">
          <p className="text-neutral-400 text-sm mb-4">Você precisa estar logado para comentar.</p>
          <a
            href="/login"
            className="inline-block bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-2 px-8 rounded-full text-sm transition-all"
          >
            Entrar agora
          </a>
        </div>
      )}

      <div className="space-y-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex gap-4">
                <div className="w-10 h-10 bg-neutral-800 rounded-full" />
                <div className="flex-grow space-y-2">
                  <div className="h-3 bg-neutral-800 rounded w-1/4" />
                  <div className="h-4 bg-neutral-800 rounded w-full" />
                  <div className="h-4 bg-neutral-800 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length > 0 ? (
          <AnimatePresence initial={false}>
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex gap-4 group"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center overflow-hidden">
                    {comment.profiles?.avatar_url ? (
                      <img src={comment.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-5 h-5 text-neutral-600" />
                    )}
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-sm">
                        {comment.profiles?.full_name || 'Usuário'}
                      </span>
                      <span className="text-[10px] text-neutral-500">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ptBR })}
                      </span>
                    </div>
                    {user?.id === comment.user_id && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-neutral-600 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-neutral-300 text-sm leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="text-center py-10">
            <p className="text-neutral-500 text-sm italic">Seja o primeiro a comentar sobre este drama!</p>
          </div>
        )}
      </div>
    </div>
  );
}
