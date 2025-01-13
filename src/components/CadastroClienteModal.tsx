import React, { useState, useEffect } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Cliente } from '../types';

interface CadastroClienteModalProps {
  show: boolean;
  handleClose: () => void;
  carregarClientes: () => void;
  clienteInicial: Partial<Cliente>;
  editingId: string | null;
}

export default function CadastroClienteModal({
  show,
  handleClose,
  carregarClientes,
  clienteInicial,
  editingId,
}: CadastroClienteModalProps) {
  const [cliente, setCliente] = useState<Partial<Cliente>>(clienteInicial);

  useEffect(() => {
    if (clienteInicial) {
      setCliente(clienteInicial);
    }
  }, [clienteInicial]);

  const handleSave = async () => {
    if (!cliente.nome) {
      toast.error('O nome é obrigatório.');
      return;
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser ();
    if (userError || !user) {
      toast.error('Erro ao obter usuário autenticado');
      return;
    }

    try {
      let response;
      if (editingId) {
        // Atualização do cliente
        response = await supabase
          .from('clientes')
          .update({
            nome: cliente.nome,
            celular: cliente.celular,
            email: cliente.email,
            cpf: cliente.cpf,
            endereco: cliente.endereco,
            observacao: cliente.observacao,
            updated_at: new Date(),
          })
          .eq('id', editingId);
      } else {
        // Criação de um novo cliente
        response = await supabase
          .from('clientes')
          .insert([
            {
              nome: cliente.nome,
              celular: cliente.celular,
              email: cliente.email,
              cpf: cliente.cpf,
              endereco: cliente.endereco,
              observacao: cliente.observacao,
              user_id: user.id, // Usar o user_id do usuário logado
            },
          ]);
      }

      if (response.error) {
        throw response.error;
      }

      // Verificar se o cliente tem dívidas ativas
      const { data: vendasAtivas, error: vendasError } = await supabase
        .from('vendas')
        .select('*')
        .eq('cliente_id', editingId)
        .eq('divida_ativa', true); // Verifica se a dívida está ativa

      const { data: caixasAtivas, error: caixasError } = await supabase
        .from('caixas_fechados')
        .select('*')
        .eq('cliente_id', editingId)
        .eq('divida_ativa', true); // Verifica se a dívida está ativa

      if (vendasError || caixasError) {
        throw vendasError || caixasError;
      }

      const temDividaAtiva = (vendasAtivas.length > 0 || caixasAtivas.length > 0);

      // Atualiza o status de divida_ativa do cliente
      await supabase
        .from('clientes')
        .update({ divida_ativa: temDividaAtiva })
        .eq('id', editingId || response.data[0].id); // Atualiza o cliente recém-criado ou editado

      toast.success(editingId ? 'Cliente atualizado com sucesso!' : 'Cliente criado com sucesso!');
      carregarClientes();
      handleClose();
    } catch (error) {
      toast.error('Erro ao salvar cliente');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCliente((prevCliente) => ({
      ...prevCliente,
      [name]: value,
    }));
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{editingId ? 'Editar Cliente' : 'Cadastrar Cliente'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="nome">
            <Form.Label>Nome</Form.Label>
            <Form.Control
              type="text"
              name="nome"
              value={cliente.nome || ''}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="celular">
            <Form.Label>Celular</Form.Label>
            <Form.Control
              type="text"
              name="celular"
              value={cliente.celular || ''}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={cliente.email || ''}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="cpf">
            <Form.Label>CPF</Form.Label>
            <Form.Control
              type="text"
              name="cpf"
              value={cliente.cpf || ''}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="endereco">
            <Form.Label>Endereço</Form.Label>
            <Form.Control
              type="text"
              name="endereco"
              value={cliente.endereco || ''}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="observacao">
            <Form.Label>Observação</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="observacao"
              value={cliente.observacao || ''}
              onChange={handleChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Fechar
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Salvar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}