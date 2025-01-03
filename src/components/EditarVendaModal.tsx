import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { supabase } from "../lib/supabase";
import { toast } from "react-hot-toast";
import type { Venda, Funcionario } from "../types";

interface EditarVendaModalProps {
  show: boolean;
  handleClose: () => void;
  venda: Venda | null;
  atualizarVenda: () => void;
  tipoTabela: 'ativas' | 'fechadas';
}

interface Produto {
  id: string;
  nome: string;
  preco: number;
  codigo: string;
  estoque: number;
  descricao: string;
  avulso?: boolean; // Adiciona a flag avulso
}

interface Item {
  produto: Produto;
  subtotal: number;
  quantidade: number;
}

const EditarVendaModal: React.FC<EditarVendaModalProps> = ({ show, handleClose, venda, atualizarVenda, tipoTabela }) => {
  const [formData, setFormData] = useState<Venda | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [descontoPorcentagem, setDescontoPorcentagem] = useState<string>(''); // Alterado para string
  const [descontoDinheiro, setDescontoDinheiro] = useState<string>(''); // Alterado para string

  useEffect(() => {
    if (venda) {
      const items = Array.isArray(venda.items) ? venda.items : [];
      setFormData({ ...venda, items, data: formatDateTime(venda.data) });
      setDescontoPorcentagem(venda.desconto_porcentagem ? venda.desconto_porcentagem.toFixed(2) : '');
      setDescontoDinheiro(venda.desconto_dinheiro ? venda.desconto_dinheiro.toFixed(2) : '');
      calculateTotal(items, venda.desconto_dinheiro ?? 0, venda.desconto_porcentagem ?? 0);
    } else {
      setFormData(null);
    }
  }, [venda]);

  useEffect(() => {
    if (show) {
      carregarFuncionarios();
    }
  }, [show]);

  const carregarFuncionarios = async () => {
    try {
      const { data, error } = await supabase.from('funcionarios').select('*');
      if (error) throw error;
      setFuncionarios(data || []);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
      toast.error('Erro ao carregar funcionários');
    }
  };

  const formatDateTime = (dateTime: string): string => {
    const date = new Date(dateTime);
    const year = date.getFullYear();
    const month = (`0${date.getMonth() + 1}`).slice(-2);
    const day = (`0${date.getDate()}`).slice(-2);
    const hours = (`0${date.getHours()}`).slice(-2);
    const minutes = (`0${date.getMinutes()}`).slice(-2);
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value } as Venda);
  };

  const handleItemChange = async (index: number, field: string, value: any) => {
    if (formData) {
      const newItems = [...formData.items];
      const [itemField, subField] = field.split('.');

      const produto = newItems[index].produto;

      if (!produto.avulso) {
        // Verificar o estoque atualizado do produto, exceto para produtos avulsos
        const produtoId = produto.id;
        const { data: produtoAtualizado, error: produtoError } = await supabase
          .from('produtos')
          .select('estoque')
          .eq('id', produtoId)
          .single();

        if (produtoError) {
          toast.error('Erro ao verificar o estoque atualizado');
          return;
        }

        if (subField) {
          newItems[index] = {
            ...newItems[index],
            [itemField]: {
              ...newItems[index][itemField],
              [subField]: value,
            },
          };
        } else {
          newItems[index] = { ...newItems[index], [itemField]: value };
        }

        const quantidadeMaxima = produtoAtualizado.estoque + venda.items[index].quantidade;
        if (itemField === "quantidade" && value > quantidadeMaxima) {
          toast.error(`Quantidade indisponível. Estoque atual: ${produtoAtualizado.estoque}`);
          return;
        }
      } else {
        // Para produtos avulsos, permitir a edição sem restrições
        if (subField) {
          newItems[index] = {
            ...newItems[index],
            [itemField]: {
              ...newItems[index][itemField],
              [subField]: value,
            },
          };
        } else {
          newItems[index] = { ...newItems[index], [itemField]: value };
        }
      }

      setFormData({ ...formData, items: newItems });
      calculateTotal(newItems, parseFloat(descontoDinheiro), parseFloat(descontoPorcentagem));
    }
  };

  const handleAddItem = () => {
    if (formData) {
      const newItems = [
        ...formData.items,
        {
          produto: { id: "", nome: "", preco: 0, codigo: "", estoque: 0, descricao: "", avulso: false },
          subtotal: 0,
          quantidade: 0,
        },
      ];
      setFormData({ ...formData, items: newItems });
      calculateTotal(newItems, parseFloat(descontoDinheiro), parseFloat(descontoPorcentagem));
    }
  };

  const handleRemoveItem = (index: number) => {
    if (formData) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
      calculateTotal(newItems, parseFloat(descontoDinheiro), parseFloat(descontoPorcentagem));
    }
  };

  const handleDescontoPorcentagemChange = (value: string) => {
    setDescontoPorcentagem(value);
    const porcentagem = value ? parseFloat(value) : 0;
    const subtotal = formData?.items.reduce((acc, item) => acc + item.produto.preco * item.quantidade, 0) || 0;
    const descontoDinheiroCalculado = ((subtotal * porcentagem) / 100).toFixed(2);
    setDescontoDinheiro(descontoDinheiroCalculado);
    calculateTotal(formData?.items ?? [], parseFloat(descontoDinheiroCalculado), porcentagem);
  };

  const handleDescontoDinheiroChange = (value: string) => {
    setDescontoDinheiro(value);
    const dinheiro = value ? parseFloat(value) : 0;
    const subtotal = formData?.items.reduce((acc, item) => acc + item.produto.preco * item.quantidade, 0) || 0;
    const descontoPorcentagemCalculado = ((dinheiro / subtotal) * 100).toFixed(2);
    setDescontoPorcentagem(descontoPorcentagemCalculado);
    calculateTotal(formData?.items ?? [], dinheiro, parseFloat(descontoPorcentagemCalculado));
  };

  const calculateTotal = (items: Item[], descontoDinheiro: number, descontoPorcentagem: number) => {
    const subtotal = items.reduce((acc, item) => acc + item.produto.preco * item.quantidade, 0);
    const totalComPorcentagem = subtotal - (subtotal * (descontoPorcentagem / 100));
    const total = totalComPorcentagem - descontoDinheiro;
    setTotal(total);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    const tabela = tipoTabela === 'ativas' ? 'vendas' : 'caixas_fechados';

    try {
      // Atualizar o estoque dos produtos antes de salvar a venda editada, exceto para produtos avulsos
      for (const item of venda.items) {
        if (!item.produto.avulso) {
          const quantidadeEditada = formData.items.find(i => i.produto.id === item.produto.id)?.quantidade || 0;
          const diferencaQuantidade = quantidadeEditada - item.quantidade;

          const { data: produtoAtualizado, error: produtoError } = await supabase
            .from('produtos')
            .select('estoque')
            .eq('id', item.produto.id)
            .single();

          if (produtoError) throw produtoError;

          const novoEstoque = produtoAtualizado.estoque - diferencaQuantidade;
          const { error: updateError } = await supabase
            .from('produtos')
            .update({ estoque: novoEstoque })
            .eq('id', item.produto.id);

          if (updateError) throw updateError;
        }
      }

      const { data, error } = await supabase
        .from(tabela)
        .update({
          ...formData,
          data: new Date(formData.data).toISOString(), // Ensure the date is in ISO format
          total,
          desconto_dinheiro: parseFloat(descontoDinheiro), // Atualizar o valor do desconto em dinheiro
          desconto_porcentagem: parseFloat(descontoPorcentagem), // Atualizar o valor do desconto em porcentagem
        })
        .eq("id", formData.id)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error("Nenhum dado retornado pelo Supabase");
      }

      toast.success("Venda atualizada com sucesso!");
      atualizarVenda(); // Chama a função para atualizar a lista de vendas
      handleClose();
    } catch (error: any) {
      console.error("Erro ao atualizar venda:", error.message);
      toast.error(`Erro ao atualizar venda: ${error.message}`);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="xl" className="modal-wide">
      <Modal.Header closeButton>
        <Modal.Title>Editar Venda</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body style={{ maxHeight: "60vh", overflowY: "auto" }}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formData">
                <Form.Label>Data e Hora</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="data"
                  value={formData?.data || ""}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="formDescontoPorcentagem">
                <Form.Label>Desconto (%)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="desconto_porcentagem"
                  value={descontoPorcentagem}
                  onChange={(e) => handleDescontoPorcentagemChange(e.target.value)}
                  min="0"
                  max="100"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="formDescontoDinheiro">
                <Form.Label>Desconto (R$)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="desconto_dinheiro"
                  value={descontoDinheiro}
                  onChange={(e) => handleDescontoDinheiroChange(e.target.value)}
                  min="0"
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formFuncionario">
                <Form.Label>Funcionário</Form.Label>
                <Form.Control
                  as="select"
                  name="funcionario_id"
                  value={formData?.funcionario_id || ""}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione o funcionário</option>
                  {funcionarios.map((funcionario) => (
                    <option key={funcionario.id} value={funcionario.id}>
                      {funcionario.nome}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formFormaPagamento">
                <Form.Label>Forma de Pagamento</Form.Label>
                <Form.Control
                  as="select"
                  name="forma_pagamento"
                  value={formData?.forma_pagamento || ""}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione a forma de pagamento</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="pix">PIX</option>
                  <option value="credito">Cartão de Crédito</option>
                  <option value="debito">Cartão de Débito</option>
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>
          <Form.Group controlId="formItems">
            <Form.Label>Itens Vendidos</Form.Label>
            {formData?.items.map((item, index) => (
              <Row key={index} className="mb-3 align-items-center">
                <Col md={4}>
                  <Form.Control
                    type="text"
                    placeholder="Nome do Produto"
                    value={item.produto.nome}
                    onChange={(e) => handleItemChange(index, "produto.nome", e.target.value)}
                    required
                  />
                </Col>
                <Col md={2}>
                  <Form.Control
                    type="number"
                    placeholder="Preço"
                    value={item.produto.preco ?? ""}
                    onChange={(e) => handleItemChange(index, "produto.preco", parseFloat(e.target.value))}
                    required
                  />
                </Col>
                <Col md={2}>
                  <Form.Control
                    type="number"
                    placeholder="Quantidade"
                    value={item.quantidade ?? ""}
                    onChange={(e) => handleItemChange(index, "quantidade", parseInt(e.target.value, 10))}
                    required
                    // Atualizar o valor máximo permitido para a quantidade, exceto para produtos avulsos
                    max={item.produto.avulso ? undefined : item.produto.estoque + venda.items[index].quantidade}
                  />
                </Col>
                <Col md={3}>
                  <Form.Control
                    type="number"
                    placeholder="Subtotal"
                    value={(item.produto.preco * item.quantidade).toFixed(2)}
                    readOnly
                  />
                </Col>
                <Col md={1}>
                  <Button variant="danger" onClick={() => handleRemoveItem(index)}>
                    Remover
                  </Button>
                </Col>
              </Row>
            ))}
            <Button variant="secondary" onClick={handleAddItem}>
              Adicionar Item
            </Button>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            Salvar
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditarVendaModal;