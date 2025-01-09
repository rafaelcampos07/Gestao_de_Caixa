import React, { useState, useEffect } from 'react';
import { Button, Table, FormControl, InputGroup, Spinner } from 'react-bootstrap';
import { supabase } from '../lib/supabase';
import { Plus, Edit2, Trash2, User, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import CadastroFuncionarioModal from './CadastroFuncionarioModal';
import ObservacaoModal from './ObservacaoModal'; // Modal para exibir observações
import type { Funcionario } from '../types';

export function CadastroFuncionario() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFuncionarioId, setCurrentFuncionarioId] = useState<string | null>(null);
  const [editingFuncionario, setEditingFuncionario] = useState<Partial<Funcionario> | null>(null);
  const [modalAction, setModalAction] = useState<'create' | 'edit' | 'delete' | 'view-observacao' | null>(null);
  const [currentObservacao, setCurrentObservacao] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarFuncionarios();
  }, []);

  const carregarFuncionarios = async () => {
    setLoading(true);
    const { data: { user }, error: userError } = await supabase.auth.getUser  ();
    if (userError || !user) {
      toast.error('Erro ao obter usuário autenticado');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('funcionarios')
      .select('*')
      .eq('user_id', user.id); // Filtra os funcionários pelo user_id

    if (error) {
      toast.error('Erro ao carregar funcionários');
      setLoading(false);
      return;
    }
    if (data) setFuncionarios(data);
    setLoading(false);
  };

  const handleEdit = (func: Funcionario) => {
    setEditingFuncionario({
      nome: func.nome,
      celular: func.celular || '',
      email: func.email || '',
      funcao: func.funcao || '',
      cpf: func.cpf || '', // Certifique-se de que o CPF está sendo passado
      observacoes: func.observacoes || '', // Certifique-se de que as observações estão sendo passadas
    });
    setCurrentFuncionarioId(func.id);
    setModalAction('edit');
    setIsModalOpen(true);
  };

  const openDeleteModal = (id: string) => {
    setCurrentFuncionarioId(id);
    setModalAction('delete');
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (currentFuncionarioId) {
      try {
        const { error } = await supabase.from('funcionarios').delete().eq('id', currentFuncionarioId);
        if (error) throw error;
        toast.success('Funcionário excluído com sucesso!');
        carregarFuncionarios();
      } catch (error) {
        toast.error('Erro ao excluir funcionário');
      } finally {
        setIsModalOpen(false);
        setCurrentFuncionarioId(null);
        setModalAction(null);
      }
    }
  };

  const openCreateModal = () => {
    setEditingFuncionario({
      nome: '',
      celular: '',
      email: '',
      funcao: '',
      cpf: '', // Adicione o CPF aqui
      observacoes: '', // Adicione as observações aqui
    });
    setCurrentFuncionarioId(null);
    setModalAction('create');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentFuncionarioId(null);
    setEditingFuncionario(null);
    setModalAction(null);
  };

  const openObservacaoModal = (observacao: string) => {
    setCurrentObservacao(observacao);
    setModalAction('view-observacao');
    setIsModalOpen(true);
  };

  const filteredFuncionarios = funcionarios.filter((func) =>
    func.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto mt-5 p-5">
      <h1 className="text-3xl font-bold text-center mb-6 flex items-center justify-center gap-2">
        <User  size={40} className="text-indigo-600" />
        Cadastro de Funcionário
      </h1>

      {loading ? (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="sr-only">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <>
          <div className="d-flex justify-content-center mb-4">
            <Button variant="primary" onClick={openCreateModal}>
              <Plus size={20} />
              Cadastrar Novo Funcionário
            </Button>
          </div>

          <h2 className="text-2xl font-bold mt-8 mb-4 text-center">Funcionários Cadastrados</h2>
          <div className="d-flex justify-content-center mb-4">
            <InputGroup className="mb-3">
              <FormControl
                placeholder="Buscar funcionário"
                aria-label="Buscar funcionário"
                aria-describedby="basic-addon2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>

          {filteredFuncionarios.length > 0 ? (
            <div className="card p-3">
              <Table responsive striped bordered hover className="table-sm">
                <thead className="bg-indigo-600 text-white text-center">
                  <tr>
                    <th>Nome</th>
                    <th>Celular</th>
                    <th>Email</th>
                    <th>Função</th>
                    <th>CPF</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFuncionarios.map((func) => (
                    <tr key={func.id}>
                      <td className="align-middle">{func.nome}</td>
                      <td className="align-middle">{func.celular}</td>
                      <td className="align-middle">{func.email}</td>
                      <td className="align-middle">{func.funcao}</td>
                      <td className="align-middle">{func.cpf}</td>
                      <td className="align-middle text-center">
                        <Button variant="outline-primary" className="btn-sm mx-1" onClick={() => handleEdit(func)}>
                          <Edit2 size={16} />
                        </Button>
                        <Button variant="outline-danger" className="btn-sm mx-1" onClick={() => openDeleteModal(func.id)}>
                          <Trash2 size={16} />
                        </Button>
                        <Button variant="outline-secondary" className="btn-sm mx-1" onClick={() => openObservacaoModal(func.observacoes || '')}>
                          <Eye size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center text-gray-500">Nenhum funcionário encontrado</div>
          )}
        </>
      )}

      <ConfirmDeleteModal
        show={modalAction === 'delete' && isModalOpen}
        handleClose={closeModal}
        handleConfirm={handleDelete}
        message="Tem certeza que deseja excluir este funcionário?"
      />
      <CadastroFuncionarioModal
        show={modalAction === 'create' || modalAction === 'edit'}
        handleClose={closeModal}
        carregarFuncionarios={carregarFuncionarios}
        funcionarioInicial={editingFuncionario || { nome: '', celular: '', email: '', funcao: '', cpf: '', observacoes: '' }}
        editingId={currentFuncionarioId}
      />
      <ObservacaoModal
        show={modalAction === 'view-observacao' && isModalOpen}
        handleClose={closeModal}
        observacao={currentObservacao || ''}
      />
    </div>
  );
}