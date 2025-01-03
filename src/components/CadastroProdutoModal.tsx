import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Save, Plus, X } from 'lucide-react';
import type { Produto } from '../types';

interface CadastroProdutoModalProps {
  show: boolean;
  handleClose: () => void;
  carregarProdutos: () => void;
  produtoInicial?: Partial<Produto>;
  editingId?: string | null;
}

const CadastroProdutoModal: React.FC<CadastroProdutoModalProps> = ({
  show,
  handleClose,
  carregarProdutos,
  produtoInicial = {
    nome: '',
    preco: '',
    precoCusto: '', // Adicionado o campo "Preço de Custo"
    descricao: '',
    codigo: '',
    estoque: '',
  },
  editingId = null,
}) => {
  const [produto, setProduto] = useState<Partial<Produto>>(produtoInicial);

  useEffect(() => {
    setProduto(produtoInicial); // Atualize o estado quando `produtoInicial` mudar
  }, [produtoInicial]);

  useEffect(() => {
    const carregarProduto = async () => {
      if (editingId) {
        const { data, error } = await supabase
          .from('produtos')
          .select('*')
          .eq('id', editingId)
          .single();

        if (error) {
          toast.error('Erro ao carregar produto para edição');
          return;
        }

        if (data) {
          setProduto({
            nome: data.nome,
            preco: data.preco.toString(),
            precoCusto: data.precoCusto ? data.precoCusto.toString() : '',
            descricao: data.descricao,
            codigo: data.codigo,
            estoque: data.estoque ? data.estoque.toString() : ''
          });
        }
      }
    };

    if (show) {
      carregarProduto();
    }
  }, [show, editingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!produto.nome || !produto.preco) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const preco = parseFloat(produto.preco);
    const precoCusto = produto.precoCusto ? parseFloat(produto.precoCusto) : null; // Não obrigatório
    const estoque = produto.estoque ? parseInt(produto.estoque) : null;

    if (isNaN(preco) || (produto.precoCusto && isNaN(precoCusto)) || (produto.estoque && isNaN(estoque))) {
      toast.error('Por favor, insira valores válidos para preço, preço de custo e estoque.');
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('produtos')
          .update({ ...produto, preco, precoCusto, estoque })
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Produto atualizado com sucesso!');
      } else {
        const { error } = await supabase.from('produtos').insert([{ ...produto, preco, precoCusto, estoque }]);

        if (error) throw error;
        toast.success('Produto cadastrado com sucesso!');
      }

      setProduto({
        nome: '',
        preco: '',
        precoCusto: '',
        descricao: '',
        codigo: '',
        estoque: '',
      });
      carregarProdutos();
      handleClose();
    } catch (error) {
      toast.error('Erro ao salvar produto');
    }
  };

  const cancelEdit = () => {
    setProduto({
      nome: '',
      preco: '',
      precoCusto: '',
      descricao: '',
      codigo: '',
      estoque: '',
    });
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{editingId ? 'Editar Produto' : 'Cadastrar Produto'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group controlId="nome" className="mb-3">
            <Form.Label>Nome</Form.Label>
            <Form.Control
              type="text"
              value={produto.nome || ''}
              onChange={(e) => setProduto({ ...produto, nome: e.target.value })}
              required
            />
          </Form.Group>
          <Form.Group controlId="preco" className="mb-3">
            <Form.Label>Preço</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              value={produto.preco || ''}
              onChange={(e) => setProduto({ ...produto, preco: e.target.value })}
              required
            />
          </Form.Group>
          <Form.Group controlId="precoCusto" className="mb-3">
            <Form.Label>Preço de Custo</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              value={produto.precoCusto || ''}
              onChange={(e) => setProduto({ ...produto, precoCusto: e.target.value })}
            />
          </Form.Group>
          <Form.Group controlId="codigo" className="mb-3">
            <Form.Label>Código</Form.Label>
            <Form.Control
              type="text"
              value={produto.codigo || ''}
              onChange={(e) => setProduto({ ...produto, codigo: e.target.value })}
            />
          </Form.Group>
          <Form.Group controlId="estoque" className="mb-3">
            <Form.Label>Estoque</Form.Label>
            <Form.Control
              type="number"
              value={produto.estoque || ''}
              onChange={(e) => setProduto({ ...produto, estoque: e.target.value })}
            />
          </Form.Group>
          <Form.Group controlId="descricao" className="mb-3">
            <Form.Label>Descrição</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={produto.descricao || ''}
              onChange={(e) => setProduto({ ...produto, descricao: e.target.value })}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelEdit}>
            <X size={20} />
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            {editingId ? <Save size={20} /> : <Plus size={20} />}
            {editingId ? 'Salvar Alterações' : 'Cadastrar Produto'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CadastroProdutoModal;