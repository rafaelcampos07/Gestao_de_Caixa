import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { supabase } from "../lib/supabase";
import { toast } from "react-hot-toast";
import type { Venda } from "../types";

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
}

interface Item {
  produto: Produto;
  subtotal: number;
  quantidade: number;
}

const EditarVendaModal: React.FC<EditarVendaModalProps> = ({ show, handleClose, venda, atualizarVenda, tipoTabela }) => {
  const [formData, setFormData] = useState<Venda | null>(null);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    if (venda) {
      const items = Array.isArray(venda.items) ? venda.items : [];
      setFormData({ ...venda, items, data: formatDateTime(venda.data) });
      calculateTotal(items, venda.desconto ?? 0);
    } else {
      setFormData(null);
    }
  }, [venda]);

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
    if (name === 'desconto') {
      calculateTotal(formData?.items ?? [], parseFloat(value));
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    if (formData) {
      const newItems = [...formData.items];
      const [itemField, subField] = field.split('.');
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
      setFormData({ ...formData, items: newItems });
      calculateTotal(newItems, formData.desconto);
    }
  };

  const handleAddItem = () => {
    if (formData) {
      const newItems = [
        ...formData.items,
        {
          produto: { id: "", nome: "", preco: 0, codigo: "", estoque: 0, descricao: "" },
          subtotal: 0,
          quantidade: 0,
        },
      ];
      setFormData({ ...formData, items: newItems });
      calculateTotal(newItems, formData.desconto);
    }
  };

  const handleRemoveItem = (index: number) => {
    if (formData) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
      calculateTotal(newItems, formData.desconto);
    }
  };

  const calculateTotal = (items: Item[], desconto: number) => {
    const subtotal = items.reduce((acc, item) => acc + item.produto.preco * item.quantidade, 0);
    const total = subtotal - (subtotal * (desconto / 100));
    setTotal(total);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    const tabela = tipoTabela === 'ativas' ? 'vendas' : 'caixas_fechados';

    try {
      console.log('Updating with data:', formData);
      const { data, error } = await supabase
        .from(tabela)
        .update({
          data: formData.data,
          items: formData.items,
          desconto: formData.desconto,
          total,
          forma_pagamento: formData.forma_pagamento,
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
              <Form.Group controlId="formDesconto">
                <Form.Label>Desconto (%)</Form.Label>
                <Form.Control
                  type="number"
                  name="desconto"
                  value={formData?.desconto ?? ""}
                  onChange={handleChange}
                  required
                  min="0"
                  max="100"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="formTotal">
                <Form.Label>Total da Venda</Form.Label>
                <Form.Control
                  type="text"
                  name="total"
                  value={total.toFixed(2)}
                  readOnly
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={12}>
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