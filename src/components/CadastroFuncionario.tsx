import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase'; // Certifique-se de que o caminho está correto
import toast from 'react-hot-toast'; // Importação do react-hot-toast
import '@fortawesome/fontawesome-free/css/all.min.css'; // Importação do Font Awesome

export const CadastroFuncionario = () => {
  const [nome, setNome] = useState('');
  const [celular, setCelular] = useState('');
  const [email, setEmail] = useState('');
  const [funcao, setFuncao] = useState('');
  const [funcionarios, setFuncionarios] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentFuncionarioId, setCurrentFuncionarioId] = useState(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    carregarFuncionarios();

    // Configurar o intervalo para atualizar os dados a cada 1 segundo
    intervalRef.current = setInterval(() => {
      console.log('Atualizando funcionários...');
      carregarFuncionarios();
    }, 1000); // 1 segundo

    // Limpar o intervalo ao desmontar o componente
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const carregarFuncionarios = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Erro ao obter usuário autenticado.');
        return;
      }

      const { data, error } = await supabase
        .from('funcionarios')
        .select('*')
        .eq('user_id', user.id); // Filtra pelo user_id do usuário autenticado

      if (error) throw error;
      setFuncionarios(data || []);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
      toast.error('Erro ao carregar funcionários');
    }
  };

  const limparCampos = () => {
    setNome('');
    setCelular('');
    setEmail('');
    setFuncao('');
    setIsEditing(false);
    setCurrentFuncionarioId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Erro ao obter usuário autenticado.');
      return;
    }

    if (isEditing && currentFuncionarioId) {
      // Atualizar funcionário existente
      const { data, error } = await supabase
        .from('funcionarios')
        .update({ nome, celular, email, funcao })
        .eq('id', currentFuncionarioId);

      if (error) {
        toast.error('Erro ao atualizar funcionário.');
        console.error('Erro ao atualizar funcionário:', error);
      } else {
        toast.success('Funcionário atualizado com sucesso.');
        if (data && data.length > 0) {
          setFuncionarios(funcionarios.map(f => (f.id === currentFuncionarioId ? data[0] : f)));
        }
        limparCampos();
      }
    } else {
      // Inserir novo funcionário
      const { data, error } = await supabase
        .from('funcionarios')
        .insert([{ nome, celular, email, funcao, user_id: user.id }]); // Inserir com user_id

      if (error) {
        toast.error('Erro ao cadastrar funcionário.');
        console.error('Erro ao cadastrar funcionário:', error);
      } else {
        toast.success('Funcionário cadastrado com sucesso.');
        if (data && data.length > 0) {
          setFuncionarios([...funcionarios, ...data]);
        }
        limparCampos();
      }
    }
  };

  const handleEdit = (funcionario) => {
    setIsEditing(true);
    setCurrentFuncionarioId(funcionario.id);
    setNome(funcionario.nome);
    setCelular(funcionario.celular);
    setEmail(funcionario.email);
    setFuncao(funcionario.funcao);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from('funcionarios')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erro ao excluir funcionário.');
      console.error('Erro ao excluir funcionário:', error);
    } else {
      toast.success('Funcionário excluído com sucesso.');
      setFuncionarios(funcionarios.filter(f => f.id !== id));
      limparCampos();
    }
  };

  return (
    <div className="container mx-auto mt-5 p-5">
      <h1 className="text-3xl font-bold text-center mb-6 flex items-center justify-center gap-2">
        <i className="fas fa-user-plus"></i> Cadastro de Funcionário
      </h1>
      <form onSubmit={handleSubmit} className="mb-6 card p-6">
        <div className="mb-4">
          <label htmlFor="nome" className="block text-gray-700 font-medium mb-2">Nome:</label>
          <div className="input-group flex items-center gap-2">
            <i className="fas fa-user text-gray-500"></i>
            <input
              type="text"
              id="nome"
              className="input-field"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="celular" className="block text-gray-700 font-medium mb-2">Celular:</label>
          <div className="input-group flex items-center gap-2">
            <i className="fas fa-phone text-gray-500"></i>
            <input
              type="tel"
              id="celular"
              className="input-field"
              value={celular}
              onChange={(e) => setCelular(e.target.value)}
            />
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email:</label>
          <div className="input-group flex items-center gap-2">
            <i className="fas fa-envelope text-gray-500"></i>
            <input
              type="email"
              id="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="funcao" className="block text-gray-700 font-medium mb-2">Função:</label>
          <div className="input-group flex items-center gap-2">
            <i className="fas fa-briefcase text-gray-500"></i>
            <input
              type="text"
              id="funcao"
              className="input-field"
              value={funcao}
              onChange={(e) => setFuncao(e.target.value)}
            />
          </div>
        </div>
        <button type="submit" className="btn-primary w-full">
          <i className="fas fa-save"></i> {isEditing ? 'Atualizar' : 'Cadastrar'}
        </button>
      </form>

      <h2 className="text-2xl font-bold mt-8 mb-4">Funcionários Cadastrados</h2>
      <div className="card p-6">
        <table className="table-auto w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2"><i className="fas fa-user"></i> Nome</th>
              <th className="px-4 py-2"><i className="fas fa-phone"></i> Celular</th>
              <th className="px-4 py-2"><i className="fas fa-envelope"></i> Email</th>
              <th className="px-4 py-2"><i className="fas fa-briefcase"></i> Função</th>
              <th className="px-4 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {funcionarios.map((funcionario) => (
              <tr key={funcionario.id}>
                <td className="border px-4 py-2">{funcionario.nome}</td>
                <td className="border px-4 py-2">{funcionario.celular}</td>
                <td className="border px-4 py-2">{funcionario.email}</td>
                <td className="border px-4 py-2">{funcionario.funcao}</td>
                <td className="border px-4 py-2 flex justify-center">
                  <button
                    className="btn-secondary mr-2"
                    onClick={() => handleEdit(funcionario)}
                  >
                    <i className="fas fa-pen text-blue-500"></i>
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => handleDelete(funcionario.id)}
                  >
                    <i className="fas fa-trash text-red-500"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};