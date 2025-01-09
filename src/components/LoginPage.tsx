import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, Mail, Lock, UserPlus, ShoppingBag, Key } from 'lucide-react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import toast from 'react-hot-toast';

export function LoginPage() {
  const [tab, setTab] = useState('login'); // login, signup, resetPassword
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [instructionsSent, setInstructionsSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(''); // Reset error message

    try {
      if (tab === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          throw new Error('Email ou Usuário incorreto');
        }
        toast.success('Login realizado com sucesso!');
      } else if (tab === 'signup') {
        if (password !== confirmPassword) {
          throw new Error('As senhas não coincidem.');
        }
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          if (error.message === 'User already registered') {
            throw new Error('Usuário já cadastrado');
          }
          throw error;
        }
        toast.success('Cadastro realizado com sucesso!');
      } else if (tab === 'resetPassword') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/update-password`
        });
        if (error) {
          throw new Error('Erro ao solicitar redefinição de senha');
        }
        toast.success('Instruções de redefinição de senha enviadas para o email!');
        setInstructionsSent(true);
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Erro ao realizar operação');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: verificationError } = await supabase.auth.verifyOtp({
        email,
        token: verificationCode,
        type: 'recovery',
      });

      if (verificationError) {
        if (verificationError.message.includes('Invalid or expired token')) {
          throw new Error('Código de verificação inválido ou expirado.');
        }
        throw verificationError;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      toast.success('Senha alterada com sucesso!');
      setTab('login');
      setInstructionsSent(false);
    } catch (error: any) {
      setErrorMessage(error.message || 'Erro ao redefinir senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="flex justify-center items-center mb-8 space-x-3">
           <img 
  src="https://i.imgur.com/2z5T4oP.png"  // Este é o link direto para a imagem do Imgur
  alt="Logo RCS Azul"
  className="w-94 h-54" 
            />
          </div>

          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            {tab === 'login' && 'Bem-vindo de volta!'}
            {tab === 'signup' && 'Criar nova conta'}
            {tab === 'resetPassword' && 'Redefinir senha'}
          </h2>

          <form onSubmit={instructionsSent ? handleResetPassword : handleAuth} className="space-y-6">
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

            {tab !== 'resetPassword' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field pl-10 pr-10"
                      placeholder="••••••••"
                      required
                    />
                    <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <AiOutlineEyeInvisible className="w-5 h-5 text-gray-400" /> : <AiOutlineEye className="w-5 h-5 text-gray-400" />}
                    </div>
                  </div>
                </div>

                {tab === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Confirmar Senha
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="input-field pl-10 pr-10"
                        placeholder="••••••••"
                        required
                      />
                      <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <AiOutlineEyeInvisible className="w-5 h-5 text-gray-400" /> : <AiOutlineEye className="w-5 h-5 text-gray-400" />}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {tab === 'resetPassword' && instructionsSent && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Código de Verificação
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="input-field pl-10"
                      placeholder="Código"
                      required
                    />
                    <Key className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nova Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input-field pl-10 pr-10"
                      placeholder="••••••••"
                      required
                    />
                    <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" onClick={() => setShowNewPassword(!showNewPassword)}>
                      {showNewPassword ? <AiOutlineEyeInvisible className="w-5 h-5 text-gray-400" /> : <AiOutlineEye className="w-5 h-5 text-gray-400" />}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirmar Nova Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="input-field pl-10 pr-10"
                      placeholder="••••••••"
                      required
                    />
                    <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" onClick={() => setShowNewPassword(!showNewPassword)}>
                      {showNewPassword ? <AiOutlineEyeInvisible className="w-5 h-5 text-gray-400" /> : <AiOutlineEye className="w-5 h-5 text-gray-400" />}
                    </div>
                  </div>
                </div>
              </>
            )}

            {errorMessage && (
              <div className="text-red-500 text-sm text-center mt-2">{errorMessage}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : tab === 'login' ? (
                <>
                  <LogIn className="w-5 h-5" />
                  Entrar
                </>
              ) : tab === 'signup' ? (
                <>
                  <UserPlus className="w-5 h-5" />
                  Cadastrar
                </>
              ) : instructionsSent ? (
                'Redefinir Senha'
              ) : (
                'Enviar Instruções'
              )}
            </button>
          </form>

          {tab === 'resetPassword' && instructionsSent && (
            <div className="mt-4 text-center text-sm text-gray-600">
              Verifique seu email para o código de verificação.
            </div>
          )}

          <div className="mt-6 text-center">
            {tab === 'login' && (
              <>
                <button
                  onClick={() => setTab('signup')}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Não tem uma conta? Cadastre-se
                </button>
                <br />
                <button
                  onClick={() => setTab('resetPassword')}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Esqueceu a senha?
                </button>
              </>
            )}
            {tab === 'signup' && (
              <button
                onClick={() => setTab('login')}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Já tem uma conta? Entre
              </button>
            )}
            {tab === 'resetPassword' && !instructionsSent && (
              <button
                onClick={() => setTab('login')}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Voltar para o login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
