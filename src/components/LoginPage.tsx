import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, Mail, Lock, UserPlus, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

export function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Login realizado com sucesso!');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Cadastro realizado com sucesso!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao realizar operação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Título com ícone */}
          <div className="flex justify-center items-center mb-8 space-x-3">
            <ShoppingBag className="w-12 h-12 text-indigo-600" />
            <h1 className="text-4xl font-extrabold text-center text-indigo-600">
              Gestão de Caixa
            </h1>
          </div>

          {/* Subtítulo */}
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            {isLogin ? 'Bem-vindo de volta!' : 'Criar nova conta'}
          </h2>

          {/* Formulário */}
          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="seu@email.com"
                  required
                />
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="••••••••"
                  required
                />
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isLogin ? (
                <>
                  <LogIn className="w-5 h-5" />
                  Entrar
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Cadastrar
                </>
              )}
            </button>
          </form>

          {/* Alternar entre login e cadastro */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              {isLogin
                ? 'Não tem uma conta? Cadastre-se'
                : 'Já tem uma conta? Entre'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
