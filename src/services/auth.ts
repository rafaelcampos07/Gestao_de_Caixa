import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export class AuthService {
  static async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  static async refreshSession() {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return null;
    }
  }

  static onAuthStateChange(callback: (session: any) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
  }

  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Desconectado com sucesso');
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Erro ao sair');
      return false;
    }
  }
}