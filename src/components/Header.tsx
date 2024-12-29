import { LogOut, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export function Header() {
  const { user } = useAuth();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('name')
        .eq('user_id', user?.id)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors

      if (!error && data?.name) {
        setUserName(data.name);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      localStorage.clear();
      toast.success('Logout realizado com sucesso!');
      window.location.reload();
    } catch (error) {
      toast.error('Erro ao realizar logout');
      console.error(error);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
      <div className="flex items-center gap-2">
        <User size={20} className="text-gray-500" />
        <span className="text-sm font-medium text-gray-700">
          {userName || user?.email}
        </span>
      </div>
      <button
        onClick={handleLogout}
        className="btn-secondary"
      >
        <LogOut size={15} />
        Sair
      </button>
    </div>
  );
}