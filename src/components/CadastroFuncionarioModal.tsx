import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Save, X } from 'lucide-react';
import type { Funcionario } from '../types';

interface CadastroFuncionarioModalProps {
  show: boolean;
  handleClose: () => void;
  carregarFuncionarios: () => void;
  funcionarioInicial?: Partial<Funcionario>;
  editingId?: string | null;
}

const CadastroFuncionarioModal: React.FC<CadastroFuncionarioModalProps> = ({
  show,
  handleClose,
  carregarFuncionarios,
  funcionarioInicial = {
    nome: '',
    celular: '',
    email: '',
    funcao: '',
    cpf: '',
    observacoes: '',
  },
  editingId = null,
}) => {
  const [funcionario, setFuncionario] = useState<Partial<Funcionario>>(funcionarioInicial);

  useEffect(() => {
    // Update the state with the initial employee data when the modal opens
    setFuncionario(funcionarioInicial);
  }, [funcionarioInicial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!funcionario.nome) {
      toast.error('Por favor, preencha o campo Nome.');
      return;
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser ();
    if (userError || !user) {
      toast.error('Erro ao obter usuário autenticado');
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('funcionarios')
          .update({ ...funcionario, user_id: user.id }) // Update user_id
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Funcionário atualizado com sucesso!');
      } else {
        const { error } = await supabase.from('funcionarios').insert([{ ...funcionario, user_id: user.id }]); // Save user_id

        if (error) throw error;
        toast.success('Funcionário cadastrado com sucesso!');
      }

      // Reset the state after the operation
      setFuncionario({
        nome: '',
        celular: '',
        email: '',
        funcao: '',
        cpf: '',
        observacoes: '',
      });
      carregarFuncionarios();
      handleClose();
    } catch (error) {
      toast.error('Erro ao salvar funcionário');
    }
  };

  const cancelEdit = () => {
    setFuncionario({
      nome: '',
      celular: '',
      email: '',
      funcao: '',
      cpf: '',
      observacoes: '',
    });
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{editingId ? 'Editar Funcionário' : 'Cadastrar Funcionário'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group controlId="nome" className="mb-3">
            <Form.Label>Nome</Form.Label>
            <Form.Control
              type="text"
              value={funcionario.nome || ''}
              onChange={(e) => setFuncionario({ ...funcionario, nome: e.target.value })}
              required
            />
          </Form.Group>
          <Form.Group controlId="celular" className="mb-3">
            <Form.Label>Celular</Form.Label>
            <Form.Control
              type="text"
              value={funcionario.celular || ''}
              onChange={(e) => setFuncionario({ ...funcionario, celular: e.target.value })}
            />
          </Form.Group>
          <Form.Group controlId="email" className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={funcionario.email || ''}
              onChange={(e) => setFuncionario({ ... funcionario, email: e.target.value })}
            />
          </Form.Group>
          <Form.Group controlId="funcao" className="mb-3">
            <Form.Label>Função</Form.Label>
            <Form.Control
              type="text"
              value={funcionario.funcao || ''}
              onChange={(e) => setFuncionario({ ...funcionario, funcao: e.target.value })}
            />
          </Form.Group>
          <Form.Group controlId="cpf" className="mb-3">
            <Form.Label>CPF</Form.Label>
            <Form.Control
              type="text"
              value={funcionario.cpf || ''}
              onChange={(e) => setFuncionario({ ...funcionario, cpf: e.target.value })}
            />
          </Form.Group>
          <Form.Group controlId="observacoes" className="mb-3">
            <Form.Label>Observações</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={funcionario.observacoes || ''}
              onChange={(e) => setFuncionario({ ...funcionario, observacoes: e.target.value })}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelEdit}>
            <X /> Cancelar
          </Button>
          <Button variant="primary" type="submit">
            <Save /> {editingId ? 'Salvar' : 'Cadastrar'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CadastroFuncionarioModal;