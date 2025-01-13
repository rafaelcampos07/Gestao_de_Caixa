import React, { useState, useEffect } from 'react';
import { Button, Table, FormControl, InputGroup, Spinner } from 'react-bootstrap';
import { supabase } from '../lib/supabase';
import { Plus, Edit2, Trash2, User, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import CadastroClienteModal from './CadastroClienteModal';
import ObservacaoModal from './ObservacaoModal';
import type { Cliente } from '../types';

export function CadastroCliente() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentClienteId, setCurrentClienteId] = useState<string | null>(null);
  const [editingCliente, setEditingCliente] = useState<Partial<Cliente> | null>(null);
  const [modalAction, setModalAction] = useState<'create' | 'edit' | 'delete' | 'view-observacao' | null>(null);
  const [currentObservacao, setCurrentObservacao] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    setLoading(true);
    const { data: { user }, error: userError } = await supabase.auth.getUser ();
    if (userError || !user) {
      toast.error('Erro ao obter usuário autenticado');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('user_id', user.id); // Carregar apenas clientes do usuário autenticado

    if (error) {
      toast.error('Erro ao carregar clientes');
      setLoading(false);
      return;
    }
    
    if (data) {
      setClientes(data);
      // Verificar divida_ativa para cada cliente
      for (const cliente of data) {
        await verificarDividaAtiva(cliente.id);
      }
    }
    setLoading(false);
  };

  const verificarDividaAtiva = async (clienteId: string) => {
    const { data: vendasAtivas, error } = await supabase
      .from('vendas')
      .select('*')
      .eq('cliente_id', clienteId)
      .eq('divida_ativa', true); // Verifica se a dívida está ativa

    if (error) {
      toast.error('Erro ao verificar vendas ativas');
      return;
    }

    const temDividaAtiva = vendasAtivas.length > 0;

    // Atualiza o status de divida_ativa do cliente
    await supabase
      .from('clientes')
      .update({ divida_ativa: temDividaAtiva })
      .eq('id', clienteId);
  };

  const handleEdit = (cli: Cliente) => {
    setEditingCliente({
      nome: cli.nome,
      celular: cli.celular || '',
      email: cli.email || '',
      cpf: cli.cpf || '',
      endereco: cli.endereco || '',
      observacao: cli.observacao || '',
      divida_ativa: cli.divida_ativa, // Incluir divida_ativa
    });
    setCurrentClienteId(cli.id);
    setModalAction('edit');
    setIsModalOpen(true);
  };

  const openDeleteModal = (id: string) => {
    setCurrentClienteId(id);
    setModalAction('delete');
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (currentClienteId) {
      try {
        const { error } = await supabase.from('clientes').delete().eq('id', currentClienteId);
        if (error) throw error;
        toast.success('Cliente excluído com sucesso!');
        carregarClientes();
      } catch (error) {
        toast.error('Erro ao excluir cliente');
      } finally {
        setIsModalOpen(false);
        setCurrentClienteId(null);
        setModalAction(null);
      }
    }
  };

  const openCreateModal = () => {
    setEditingCliente({
      nome: '',
      celular: '',
      email: '',
      cpf: '',
      endereco: '',
      observacao: '',
      divida_ativa: false, // Definir divida_ativa como false por padrão
    });
    setCurrentClienteId(null);
    setModalAction('create');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentClienteId(null);
    setEditingCliente(null);
    setModalAction(null);
  };

  const openObservacaoModal = (observacao: string) => {
    setCurrentObservacao(observacao);
    setModalAction('view-observacao');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (editingCliente) {
      try {
        if (currentClienteId) {
          // Atualizar cliente existente
          await supabase
            .from('clientes')
            .update(editingCliente)
            .eq('id', currentClienteId);
          await verificarDividaAtiva(currentClienteId);
          toast.success('Cliente atualizado com sucesso!');
        } else {
          // Criar novo cliente
          await supabase
            .from('clientes')
            .insert([{ ...editingCliente, user_id: (await supabase.auth.getUser ()).data.user.id }]);
          toast.success('Cliente criado com sucesso!');
        }
        carregarClientes();
      } catch (error) {
        toast.error('Erro ao salvar cliente');
      } finally {
        closeModal();
      }
    }
  };

  const filteredClientes = clientes.filter((cli) =>
    cli.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto mt-5 p-5">
      <h1 className="text-3xl font-bold text-center mb-6 flex items-center justify-center gap-2">
        <User  size={40} className="text-indigo-600" />
        Cadastro de Cliente
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
              Cadastrar Novo Cliente
            </Button>
          </div>

          <h2 className="text-2xl font-bold mt-8 mb-4 text-center">Clientes Cadastrados</h2>
          <div className="d-flex justify-content-center mb-4">
            <InputGroup className="mb-3">
              <FormControl
                placeholder="Buscar cliente"
                aria-label="Buscar cliente"
                aria-describedby="basic-addon2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>

          {filteredClientes.length > 0 ? (
            <div className="card p-3">
              <Table responsive striped bordered hover className="table-sm">
                <thead className="bg-indigo-600 text-white text-center">
                  <tr>
                    <th>Nome</th>
                    <th>Celular</th>
                    <th>Email</th>
                    <th>CPF</th>
                    <th>Endereço</th>
                    <th>Dívida Ativa</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClientes.map((cli) => (
                    <tr
                      key={cli.id}
                      className={cli.divida_ativa ? 'table-danger' : ''} // Linhas em vermelho se tiver dívida ativa
                    >
                      <td className="align-middle">{cli.nome}</td>
                      <td className="align-middle">{cli.celular}</td>
                      <td className="align-middle">{cli.email}</td>
                      <td className="align-middle">{cli.cpf}</td>
                      <td className="align-middle ">{cli.endereco || 'N/A'}</td>
                      <td className="align-middle">{cli.divida_ativa ? 'Sim' : 'Não'}</td>
                      <td className="align-middle text-center">
                        <Button variant="outline-primary" className="btn-sm mx-1" onClick={() => handleEdit(cli)}>
                          <Edit2 size={16} />
                        </Button>
                        <Button variant="outline-danger" className="btn-sm mx-1" onClick={() => openDeleteModal(cli.id)}>
                          <Trash2 size={16} />
                        </Button>
                        <Button variant="outline-secondary" className="btn-sm mx-1" onClick={() => openObservacaoModal(cli.observacao || '')}>
                          <Eye size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center text-gray-500">Nenhum cliente encontrado</div>
          )}
        </>
      )}

      <ConfirmDeleteModal
        show={modalAction === 'delete' && isModalOpen}
        handleClose={closeModal}
        handleConfirm={handleDelete}
        message="Tem certeza que deseja excluir este cliente?"
      />
      <CadastroClienteModal
        show={modalAction === 'create' || modalAction === 'edit'}
        handleClose={closeModal}
        carregarClientes={carregarClientes}
        clienteInicial={editingCliente || { nome: '', celular: '', email: '', cpf: '', endereco: '', observacao: '', divida_ativa: false }}
        editingId={currentClienteId}
        handleSave={handleSave}
      />
      <ObservacaoModal
        show={modalAction === 'view-observacao' && isModalOpen}
        handleClose={closeModal}
        observacao={currentObservacao || ''}
      />
    </div>
  );
}