import { LogOut, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export function Header() {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.reload();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
      <div className="flex items-center gap-2">
        <User size={20} className="text-gray-500" />
        <span className="text-sm font-medium text-gray-700">
          {user?.email}
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