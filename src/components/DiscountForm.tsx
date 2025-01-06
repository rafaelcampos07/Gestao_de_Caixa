import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';

interface DiscountFormProps {
  descontoPorcentagem: string;
  descontoDinheiro: string;
  onPorcentagemChange: (value: string) => void;
  onDinheiroChange: (value: string) => void;
}

export function DiscountForm({
  descontoPorcentagem,
  descontoDinheiro,
  onPorcentagemChange,
  onDinheiroChange
}: DiscountFormProps) {
  return (
    <Row className="mb-3">
      <Col md={6}>
        <Form.Group controlId="formDescontoPorcentagem">
          <Form.Label>Desconto (%)</Form.Label>
          <Form.Control
            type="number"
            step="0.01"
            value={descontoPorcentagem}
            onChange={(e) => onPorcentagemChange(e.target.value)}
            min="0"
            max="100"
          />
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group controlId="formDescontoDinheiro">
          <Form.Label>Desconto (R$)</Form.Label>
          <Form.Control
            type="number"
            step="0.01"
            value={descontoDinheiro}
            onChange={(e) => onDinheiroChange(e.target.value)}
            min="0"
          />
        </Form.Group>
      </Col>
    </Row>
  );
}