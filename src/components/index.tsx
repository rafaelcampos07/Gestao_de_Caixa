import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { supabase } from "../../lib/supabase";
import { toast } from "react-hot-toast";
import type { Venda, Funcionario } from "../../types";
import { ItemForm } from './ItemForm';
import { DiscountForm } from './DiscountForm';
import { calculateTotal, handleStockUpdates } from './utils';

interface EditarVendaModalProps {
  show: boolean;
  handleClose: () => void;
  venda: Venda | null;
  atualizarVenda: () => void;
  tipoTabela: 'ativas' | 'fechadas';
}

export default function EditarVendaModal({ 
  show, 
  handleClose, 
  venda, 
  atualizarVenda, 
  tipoTabela 
}: EditarVendaModalProps) {
  const [formData, setFormData] = useState<Venda | null>(null);
  const [originalItems, setOriginalItems] = useState<any[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [descontoPorcentagem, setDescontoPorcentagem] = useState<string>('');
  const [descontoDinheiro, setDescontoDinheiro] = useState<string>('');
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    if (venda) {
      setFormData({ ...venda });
      setOriginalItems([...venda.items]);
      setDescontoPorcentagem(venda.desconto_porcentagem ? venda.desconto_porcentagem.toFixed(2) : '');
      setDescontoDinheiro(venda.desconto_dinheiro ? venda.desconto_dinheiro.toFixed(2) : '');
      calculateTotal(venda.items, venda.desconto_dinheiro ?? 0, venda.desconto_porcentagem ?? 0);
    }
    if (show) {
      carregarFuncionarios();
    }
  }, [venda, show]);

  // Rest of the component implementation...
  // (Keep all the existing functions but move some logic to utils.ts)

  return (
    <Modal show={show} onHide={handleClose} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Editar Venda</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <DiscountForm
            descontoPorcentagem={descontoPorcentagem}
            descontoDinheiro={descontoDinheiro}
            onPorcentagemChange={handleDescontoPorcentagemChange}
            onDinheiroChange={handleDescontoDinheiroChange}
          />
          
          {formData?.items.map((item, index) => (
            <ItemForm
              key={index}
              item={item}
              index={index}
              originalQuantity={originalItems[index]?.quantidade || 0}
              onQuantityChange={handleQuantityChange}
              onItemChange={handleItemChange}
              onRemove={handleRemoveItem}
            />
          ))}
          
          {/* Rest of the form... */}
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
}