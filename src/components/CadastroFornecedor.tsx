import React, { useState, useEffect } from 'react';
import { Button, Table, FormControl, InputGroup, Spinner } from 'react-bootstrap';
import { supabase } from '../lib/supabase';
import { Plus, Edit2, Trash2, User } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import CadastroFornecedorModal from './CadastroFornecedorModal'; // Modal para cadastro de fornecedor
import type { Fornecedor } from '../types'; // Importação corrigida

export function CadastroFornecedor() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFornecedorId, setCurrentFornecedorId] = useState<string | null>(null);
  const [editingFornecedor, setEditingFornecedor] = useState<Partial<Fornecedor> | null>(null);
  const [modalAction, setModalAction] = useState<'create' | 'edit' | 'delete' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarFornecedores();
  }, []);

  const carregarFornecedores = async () => {
    setLoading(true);
    const { data: { user }, error: userError } = await supabase.auth.getUser ();
    if (userError || !user) {
      toast.error('Erro ao obter usuário autenticado');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('fornecedores')
      .select('*')
      .eq('user_id', user.id); // Filtra os fornecedores pelo user_id

    if (error) {
      toast.error('Erro ao carregar fornecedores');
      setLoading(false);
      return;
    }
    if (data) setFornecedores(data);
    setLoading(false);
  };

  const handleEdit = (fornecedor: Fornecedor) => {
    setEditingFornecedor({
      nome: fornecedor.nome,
      telefone: fornecedor.telefone || '',
      email: fornecedor.email || '',
      endereco: fornecedor.endereco || '',
    });
    setCurrentFornecedorId(fornecedor.id);
    setModalAction('edit');
    setIsModalOpen(true);
  };

  const openDeleteModal = (id: string) => {
    setCurrentFornecedorId(id);
    setModalAction('delete');
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (currentFornecedorId) {
      try {
        const { error } = await supabase.from('fornecedores').delete().eq('id', currentFornecedorId);
        if (error) throw error;
        toast.success('Fornecedor excluído com sucesso!');
        carregarFornecedores();
      } catch (error) {
        toast.error('Erro ao excluir fornecedor');
      } finally {
        setIsModalOpen(false);
        setCurrentFornecedorId(null);
        setModalAction(null);
      }
    }
  };

  const openCreateModal = () => {
    setEditingFornecedor({
      nome: '',
      telefone: '',
      email: '',
      endereco: '',
    });
    setCurrentFornecedorId(null);
    setModalAction('create');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentFornecedorId(null);
    setEditingFornecedor(null);
    setModalAction(null);
  };

  const filteredFornecedores = fornecedores.filter((fornecedor) =>
    fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto mt-5 p-5">
      <h1 className="text-3xl font-bold text-center mb-6 flex items-center justify-center gap-2">
        <User  size={40} className="text-indigo-600" />
        Cadastro de Fornecedor
      </h1>

      {loading ? (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" role="status" style={{ width: '3rem', height : '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <>
          <div className="d-flex justify-content-center mb-4">
            <Button variant="primary" onClick={openCreateModal}>
              <Plus size={20} />
              Cadastrar Novo Fornecedor
            </Button>
          </div>

          <h2 className="text-2xl font-bold mt-8 mb-4 text-center">Fornecedores Cadastrados</h2>
          <div className="d-flex justify-content-center mb-4">
            <InputGroup className="mb-3">
              <FormControl placeholder="Buscar fornecedor"
                aria-label="Buscar fornecedor"
                aria-describedby="basic-addon2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>

          {filteredFornecedores.length > 0 ? (
            <div className="card p-3">
              <Table responsive striped bordered hover className="table-sm">
                <thead className="bg-indigo-600 text-white text-center">
                  <tr>
                    <th>Nome</th>
                    <th>Telefone</th>
                    <th>Email</th>
                    <th>Endereço</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFornecedores.map((fornecedor) => (
                    <tr key={fornecedor.id}>
                      <td className="align-middle">{fornecedor.nome}</td>
                      <td className="align-middle">{fornecedor.telefone}</td>
                      <td className="align-middle">{fornecedor.email}</td>
                      <td className="align-middle">{fornecedor.endereco}</td>
                      <td className="align-middle text-center">
                        <Button variant="outline-primary" className="btn-sm mr-2" onClick={() => handleEdit(fornecedor)}>
                          <Edit2 size={16} />
                        </Button>
                        <Button variant="outline-danger" className="btn-sm" onClick={() => openDeleteModal(fornecedor.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center text-gray-500">Nenhum fornecedor encontrado</div>
          )}
        </>
      )}

      <ConfirmDeleteModal
        show={modalAction === 'delete' && isModalOpen}
        handleClose={closeModal}
        handleConfirm={handleDelete}
        message="Tem certeza que deseja excluir este fornecedor?"
      />
      <CadastroFornecedorModal
        show={modalAction === 'create' || modalAction === 'edit'}
        handleClose={closeModal}
        carregarFornecedores={carregarFornecedores}
        fornecedorInicial={editingFornecedor || { nome: '', telefone: '', email: '', endereco: '' }}
        editingId={currentFornecedorId}
      />
    </div>
  );
}