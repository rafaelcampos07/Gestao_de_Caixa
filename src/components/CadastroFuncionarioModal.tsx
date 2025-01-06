import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Save, Plus, X } from 'lucide-react';
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
  },
  editingId = null,
}) => {
  const [funcionario, setFuncionario] = useState<Partial<Funcionario>>(funcionarioInicial);

  useEffect(() => {
    setFuncionario(funcionarioInicial);
  }, [funcionarioInicial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verifique se o nome está preenchido
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
          .update({ ...funcionario, user_id: user.id }) // Atualiza o user_id
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Funcionário atualizado com sucesso!');
      } else {
        const { error } = await supabase.from('funcionarios').insert([{ ...funcionario, user_id: user.id }]); // Salva o user_id

        if (error) throw error;
        toast.success('Funcionário cadastrado com sucesso!');
      }

      setFuncionario({
        nome: '',
        celular: '',
        email: '',
        funcao: '',
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
              onChange={(e) => setFuncionario({ ...funcionario, email: e.target.value })}
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelEdit}>
            <X /> Cancelar
          </Button>
          <Button variant="primary" type="submit">
            <Save /> Salvar
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CadastroFuncionarioModal;