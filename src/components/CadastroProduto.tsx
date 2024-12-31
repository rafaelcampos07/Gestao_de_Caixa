import React, { useState, useEffect } from 'react';
import { Button, Table } from 'react-bootstrap';
import { supabase } from '../lib/supabase';
import { Plus, Edit2, Save, X, Trash2, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import type { Produto } from '../types';

export function CadastroProduto() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [produto, setProduto] = useState<Partial<Produto>>({
    nome: '',
    preco: '',
    descricao: '',
    codigo: '',
    estoque: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    const { data, error } = await supabase.from('produtos').select('*');
    if (error) {
      toast.error('Erro ao carregar produtos');
      return;
    }
    if (data) setProdutos(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!produto.nome || !produto.preco) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const preco = parseFloat(produto.preco);
    const estoque = produto.estoque ? parseInt(produto.estoque) : null;

    if (isNaN(preco) || (produto.estoque && isNaN(estoque))) {
      toast.error('Por favor, insira valores válidos para preço e estoque.');
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('produtos')
          .update({ ...produto, preco, estoque })
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Produto atualizado com sucesso!');
        setEditingId(null);
      } else {
        const { error } = await supabase.from('produtos').insert([{ ...produto, preco, estoque }]);

        if (error) throw error;
        toast.success('Produto cadastrado com sucesso!');
      }

      setProduto({
        nome: '',
        preco: '',
        descricao: '',
        codigo: '',
        estoque: '',
      });
      carregarProdutos();
    } catch (error) {
      toast.error('Erro ao salvar produto');
    }
  };

  const handleEdit = (prod: Produto) => {
    setEditingId(prod.id);
    setProduto({
      nome: prod.nome,
      preco: prod.preco ? prod.preco.toString() : '',
      descricao: prod.descricao,
      codigo: prod.codigo,
      estoque: prod.estoque ? prod.estoque.toString() : '',
    });
  };

  const openDeleteModal = (id: string) => {
    setCurrentProductId(id);
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
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setProduto({
      nome: '',
      preco: '',
      descricao: '',
      codigo: '',
      estoque: '',
    });
  };

  return (
    <div className="container mx-auto mt-5 p-5">
      <h1 className="text-3xl font-bold text-center mb-6 flex items-center justify-center gap-2">
        <Package size={40} className="text-indigo-600" />
        Cadastro de Produto
      </h1>
      <form onSubmit={handleSubmit} className="mb-6 card p-6">
        <div className="mb-4">
          <label htmlFor="nome" className="block text-gray-700 font-medium mb-2">Nome:</label>
          <div className="input-group flex items-center gap-2">
            <input
              type="text"
              id="nome"
              className="input-field"
              value={produto.nome}
              onChange={(e) => setProduto((prev) => ({ ...prev, nome: e.target.value }))}
              required
            />
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="preco" className="block text-gray-700 font-medium mb-2">Preço:</label>
          <div className="input-group flex items-center gap-2">
            <input
              type="number"
              step="0.01"
              id="preco"
              className="input-field"
              value={produto.preco}
              onChange={(e) => setProduto((prev) => ({
                ...prev,
                preco: e.target.value,
              }))}
              required
            />
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="codigo" className="block text-gray-700 font-medium mb-2">Código:</label>
          <div className="input-group flex items-center gap-2">
            <input
              type="text"
              id="codigo"
              className="input-field"
              value={produto.codigo}
              onChange={(e) => setProduto((prev) => ({ ...prev, codigo: e.target.value }))}
            />
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="estoque" className="block text-gray-700 font-medium mb-2">Estoque:</label>
          <div className="input-group flex items-center gap-2">
            <input
              type="number"
              id="estoque"
              className="input-field"
              value={produto.estoque}
              onChange={(e) => setProduto((prev) => ({
                ...prev,
                estoque: e.target.value,
              }))}
            />
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="descricao" className="block text-gray-700 font-medium mb-2">Descrição:</label>
          <div className="input-group flex items-center gap-2">
            <textarea
              id="descricao"
              className="input-field"
              rows={3}
              value={produto.descricao}
              onChange={(e) => setProduto((prev) => ({ ...prev, descricao: e.target.value }))}
            />
          </div>
        </div>
        <Button type="submit" className="btn-primary w-full">
          {editingId ? <Save size={20} /> : <Plus size={20} />}
          {editingId ? 'Salvar Alterações' : 'Cadastrar Produto'}
        </Button>
        {editingId && (
          <Button
            type="button"
            onClick={cancelEdit}
            className="btn-secondary w-full mt-2"
          >
            <X size={20} />
            Cancelar
          </Button>
        )}
      </form>

      <h2 className="text-2xl font-bold mt-8 mb-4">Produtos Cadastrados</h2>
      <div className="card p-6">
        <Table striped bordered hover>
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2">Nome</th>
              <th className="px-4 py-2">Preço</th>
              <th className="px-4 py-2">Código</th>
              <th className="px-4 py-2">Estoque</th>
              <th className="px-4 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((prod) => (
              <tr key={prod.id}>
                <td className="border px-4 py-2">{prod.nome}</td>
                <td className="border px-4 py-2">R$ {parseFloat(prod.preco).toFixed(2)}</td>
                <td className="border px-4 py-2">{prod.codigo}</td>
                <td className="border px-4 py-2">{prod.estoque}</td>
                <td className="border px-4 py-2 flex justify-center">
                  <Button
                    className="btn-secondary mr-2"
                    onClick={() => handleEdit(prod)}
                  >
                    <Edit2 size={20} className="text-blue-500" />
                  </Button>
                  <Button
                    className="btn-secondary"
                    onClick={() => openDeleteModal(prod.id)}
                  >
                    <Trash2 size={20} className="text-red-500" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <ConfirmDeleteModal
        show={isModalOpen}
        handleClose={() => setIsModalOpen(false)}
        handleConfirm={handleDelete}
        message="Tem certeza que deseja excluir este produto?"
      />
    </div>
  );
}