import React, { useState, useEffect } from 'react';
import { Button, Table, FormControl, InputGroup, Spinner } from 'react-bootstrap';
import { supabase } from '../lib/supabase';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import CadastroProdutoModal from './CadastroProdutoModal';
import type { Produto, Fornecedor } from '../types';

export function CadastroProduto() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]); // Novo estado para fornecedores
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [editingProduto, setEditingProduto] = useState<Partial<Produto> | null>(null);
  const [modalAction, setModalAction] = useState<'create' | 'edit' | 'delete' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarFornecedores(); // Carregar fornecedores ao iniciar
    carregarProdutos();
  }, []);

  const carregarFornecedores = async () => {
    const { data, error } = await supabase.from('fornecedores').select('*');
    if (error) {
      toast.error('Erro ao carregar fornecedores');
      return;
    }
    if (data) setFornecedores(data);
  };

  const carregarProdutos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('produtos')
      .select('*, fornecedores(*)'); // Carregar produtos com dados do fornecedor
    if (error) {
      toast.error('Erro ao carregar produtos');
      return;
    }
    if (data) setProdutos(data);
    setLoading(false);
  };

  const handleEdit = (prod: Produto) => {
    setEditingProduto({
      nome: prod.nome,
      preco: prod.preco ? prod.preco.toString() : '',
      precoCusto: prod.precoCusto ? prod.precoCusto.toString() : '',
      descricao: prod.descricao,
      codigo: prod.codigo,
      estoque: prod.estoque ? prod.estoque.toString() : '',
      fornecedor_id: prod.fornecedor_id, // Adicionar fornecedor_id
    });
    setCurrentProductId(prod.id);
    setModalAction('edit');
    setIsModalOpen(true);
  };

  const openDeleteModal = (id: string) => {
    setCurrentProductId(id);
    setModalAction('delete');
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (currentProductId) {
      try {
        const { error } = await supabase.from('produtos').delete().eq('id', currentProductId);
        if (error) throw error;
        toast.success('Produto excluído com sucesso!');
        carregarProdutos();
      } catch (error) {
        toast.error('Erro ao excluir produto');
      } finally {
        setIsModalOpen(false);
        setCurrentProductId(null);
        setModalAction(null);
      }
    }
  };

  const openCreateModal = () => {
    setEditingProduto({
      nome: '',
      preco: '',
      precoCusto: '',
      descricao: '',
      codigo: '',
      estoque: '',
      fornecedor_id: '', // Adicionar fornecedor_id
    });
    setCurrentProductId(null);
    setModalAction('create');
    setIsModalOpen(true);
 };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentProductId(null);
    setEditingProduto(null);
    setModalAction(null);
  };

  const filteredProdutos = produtos.filter((prod) =>
    prod.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto mt-5 p-5">
      <h1 className="text-3xl font-bold text-center mb-6 flex items-center justify-center gap-2">
        <Package size={40} className="text-indigo-600" />
        Cadastro de Produto
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
              Cadastrar Novo Produto
            </Button>
          </div>

          <h2 className="text-2xl font-bold mt-8 mb-4 text-center">Produtos Cadastrados</h2>
          <div className="d-flex justify-content-center mb-4">
            <InputGroup className="mb-3">
              <FormControl
                placeholder="Buscar produto"
                aria-label="Buscar produto"
                aria-describedby="basic-addon2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>

          {filteredProdutos.length > 0 ? (
            <div className="card p-3">
              <Table responsive striped bordered hover className="table-sm">
                <thead className="bg-primary text-white text-center">
                  <tr>
                    <th>Nome</th>
                    <th>Preço</th>
                    <th>Preço de Custo</th>
                    <th>Código</th>
                    <th>Estoque</th>
                    <th>Fornecedor</th> {/* Nova coluna para o fornecedor */}
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProdutos.map((prod) => (
                    <tr key={prod.id}>
                      <td className="align-middle">{prod.nome}</td>
                      <td className="align-middle">R$ {parseFloat(prod.preco).toFixed(2)}</td>
                      <td className="align-middle">R$ {prod.precoCusto ? parseFloat(prod.precoCusto).toFixed(2) : 'N/A'}</td>
                      <td className="align-middle">{prod.codigo}</td>
                      <td className="align-middle">{prod.estoque}</td>
                      <td className="align-middle">{prod.fornecedores?.nome || 'N/A'}</td> {/* Exibir nome do fornecedor */}
                      <td className="align-middle text-center">
                        <Button variant="outline-primary" className="btn-sm mr-2" onClick={() => handleEdit(prod)}>
                          <Edit2 size={16} />
                        </Button>
                        <Button variant="outline-danger" className="btn-sm" onClick={() => openDeleteModal(prod.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center text-gray-500">Nenhum produto encontrado</div>
          )}
        </>
      )}

      <ConfirmDeleteModal
        show={modalAction === 'delete' && isModalOpen}
        handleClose={closeModal}
        handleConfirm={handleDelete}
        message="Tem certeza que deseja excluir este produto?"
      />
      <CadastroProdutoModal
        show={modalAction === 'create' || modalAction === 'edit'}
        handleClose={closeModal}
        carregarProdutos={carregarProdutos}
        produtoInicial={editingProduto || { nome: '', preco: '', precoCusto: '', descricao: '', codigo: '', estoque: '', fornecedor_id: '' }}
        editingId={currentProductId}
      />
    </div>
  );
}