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
  avulso?: boolean;
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
  const [descontoPorcentagem, setDescontoPorcentagem] = useState<string>('');
  const [descontoDinheiro, setDescontoDinheiro] = useState<string>('');

  useEffect(() => {
    if (venda) {
      const items = Array.isArray(venda.items) ? venda.items : [];
      setFormData({ ...venda, items, data: formatDateTime(venda.data) });
      setDescontoPorcentagem(venda.desconto_porcentagem ? venda.desconto_porcentagem.toFixed(2) : '');
      setDescontoDinheiro(venda.desconto_dinheiro ? venda.desconto_dinheiro.toFixed(2) : '');
      calculateTotal(items);
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

        newItems[index].produto.estoque = produtoAtualizado.estoque;
      } else {
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

      // Atualiza o subtotal do item
      newItems[index].subtotal = newItems[index].produto.preco * newItems[index].quantidade;

      setFormData({ ...formData, items: newItems });
      calculateTotal(newItems);
    }
  };

  const handleDescontoPorcentagemChange = (value: string) => {
    setDescontoPorcentagem(value);
    const porcentagem = value ? parseFloat(value) : 0;
    const subtotal = formData?.items.reduce((acc, item) => acc + item.subtotal, 0) || 0;
    const descontoDinheiroCalculado = ((subtotal * porcentagem) / 100).toFixed(2);
    setDescontoDinheiro(descontoDinheiroCalculado);
    calculateTotal(formData?.items ?? [], parseFloat(descontoDinheiroCalculado), porcentagem);
  };

  const handleDescontoDinheiroChange = (value: string) => {
    setDescontoDinheiro(value);
    const dinheiro = value ? parseFloat(value) : 0;
    const subtotal = formData?.items.reduce((acc, item) => acc + item.subtotal, 0) || 0;
    const descontoPorcentagemCalculado = ((dinheiro / subtotal) * 100).toFixed(2);
    setDescontoPorcentagem(descontoPorcentagemCalculado);
    calculateTotal(formData?.items ?? [], dinheiro, parseFloat(descontoPorcentagemCalculado));
  };

  const calculateTotal = (items: Item[], descontoDinheiro: number = 0, descontoPorcentagem: number = 0) => {
    const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
    const totalComPorcentagem = subtotal - (subtotal * (descontoPorcentagem / 100));
    const total = totalComPorcentagem - descontoDinheiro;

    // Ensure total is a valid number
    setTotal(isNaN(total) ? 0 : total);
  };

  const validateFormData = () => {
    if (!formData) return false;
    if (!formData.data || !formData.funcionario_id || !formData.forma_pagamento) return false;
    if (formData.items.length === 0) return false;

    for (const item of formData.items) {
      if (!item.produto.nome || item.produto.preco <= 0 || item.quantidade <= 0) return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFormData()) {
      toast.error("Preencha todos os campos corretamente antes de salvar.");
      return;
    }

    const tabela = tipoTabela === 'ativas' ? 'vendas' : 'caixas_fechados';

    try {
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

      const descontoDinheiroValue = descontoDinheiro ? parseFloat(descontoDinheiro) : 0;
      const descontoPorcentagemValue = descontoPorcentagem ? parseFloat(descontoPorcentagem) : 0;

      // Log the total and items before saving
      console.log("Total calculado antes de salvar:", total);
      console.log("Items antes de salvar:", formData.items);

      const { data, error } = await supabase
        .from(tabela)
        .update({
          ...formData,
          data: new Date(formData.data).toISOString(),
          total: total, // Ensure total is being passed correctly
          items: formData.items, // Ensure items are being passed correctly
          desconto_dinheiro: descontoDinheiroValue,
          desconto_porcentagem: descontoPorcentagemValue,
        })
        .eq("id", formData.id)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error("Nenhum dado retornado pelo Supabase");
      }

      toast.success("Venda atualizada com sucesso!");
      atualizarVenda();
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
                    disabled={!item.produto.avulso} // Disable the name field if the product is not avulso
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
                    max={item.produto.avulso ? undefined : item.produto.estoque + venda.items[index].quantidade}
                  />
                </Col>
                <Col md={3}>
                  <Form.Control
                    type="number"
                    placeholder="Subtotal"
                    value={item.subtotal.toFixed(2)}
                    readOnly
                  />
                </Col>
              </Row>
            ))}
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