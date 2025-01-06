import React from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import type { ItemVenda } from '../../types';

interface ItemFormProps {
  item: ItemVenda;
  index: number;
  originalQuantity: number;
  onQuantityChange: (index: number, quantidade: number) => void;
  onItemChange: (index: number, field: string, value: any) => void;
  onRemove: (index: number) => void;
}

export function ItemForm({ 
  item, 
  index, 
  originalQuantity,
  onQuantityChange, 
  onItemChange, 
  onRemove 
}: ItemFormProps) {
  return (
    <Row className="mb-3 align-items-center">
      <Col md={4}>
        <Form.Control
          type="text"
          placeholder="Nome do Produto"
          value={item.produto.nome}
          onChange={(e) => onItemChange(index, "produto.nome", e.target.value)}
          required
        />
      </Col>
      <Col md={2}>
        <Form.Control
          type="number"
          placeholder="Preço"
          value={item.produto.preco ?? ""}
          onChange={(e) => onItemChange(index, "produto.preco", parseFloat(e.target.value))}
          required
          readOnly={!item.produto.avulso}
        />
      </Col>
      <Col md={2}>
        <Form.Control
          type="number"
          placeholder="Quantidade"
          value={item.quantidade ?? ""}
          onChange={(e) => onQuantityChange(index, parseInt(e.target.value, 10))}
          required
          min={1}
          max={item.produto.avulso ? undefined : item.produto.estoque + originalQuantity}
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
        <Button variant="danger" onClick={() => onRemove(index)}>
          Remover
        </Button>
      </Col>
    </Row>
  );
}