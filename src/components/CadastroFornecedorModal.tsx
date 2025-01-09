import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Save, X } from 'lucide-react';

interface CadastroFornecedorModalProps {
  show: boolean;
  handleClose: () => void;
  carregarFornecedores: () => void;
  fornecedorInicial: {
    nome: string;
    telefone?: string;
    email?: string;
    endereco?: string;
    cpf_cnpj?: string;
    observacao?: string;
  } | null;
  editingId?: string | null;
}

const CadastroFornecedorModal: React.FC<CadastroFornecedorModalProps> = ({
  show,
  handleClose,
  carregarFornecedores,
  fornecedorInicial,
  editingId,
}) => {
  const [nome, setNome] = useState(fornecedorInicial?.nome || '');
  const [telefone, setTelefone] = useState(fornecedorInicial?.telefone || '');
  const [email, setEmail] = useState(fornecedorInicial?.email || '');
  const [endereco, setEndereco] = useState(fornecedorInicial?.endereco || '');
  const [cpfCnpj, setCpfCnpj] = useState(fornecedorInicial?.cpf_cnpj || '');
  const [observacao, setObservacao] = useState(fornecedorInicial?.observacao || '');
  const [action, setAction] = useState(editingId ? 'edit' : 'create');

  useEffect(() => {
    if (fornecedorInicial) {
      setNome(fornecedorInicial.nome);
      setTelefone(fornecedorInicial.telefone || '');
      setEmail(fornecedorInicial.email || '');
      setEndereco(fornecedorInicial.endereco || '');
      setCpfCnpj(fornecedorInicial.cpf_cnpj || '');
      setObservacao(fornecedorInicial.observacao || '');
    }
  }, [fornecedorInicial]);

  useEffect(() => {
    setAction(editingId ? 'edit' : 'create');
  }, [editingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast.error('Erro ao obter usuário autenticado');
        return;
      }
      const userId = user.id;

      if (!nome) {
        toast.error('Por favor, preencha o campo Nome.');
        return;
      }

      if (action === 'create') {
        const { error } = await supabase.from('fornecedores').insert([
          {
            nome,
            telefone,
            email,
            endereco,
            cpf_cnpj: cpfCnpj,
            observacao,
            user_id: userId,
            created_at: new Date().toISOString(),
          },
        ]);
        if (error) throw error;
        toast.success('Fornecedor criado com sucesso!');
      } else if (action === 'edit' && editingId) {
        const { error } = await supabase
          .from('fornecedores')
          .update({ nome, telefone, email, endereco, cpf_cnpj: cpfCnpj, observacao })
          .eq('id', editingId);
        if (error) throw error;
        toast.success('Fornecedor atualizado com sucesso!');
      }
      carregarFornecedores();
      handleClose();
    } catch (error) {
      toast.error('Erro ao salvar fornecedor');
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{action === 'create' ? 'Adicionar Fornecedor' : 'Editar Fornecedor'}</Modal.Title>
 </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group controlId="formNome" className="mb-3">
            <Form.Label>Nome</Form.Label>
            <Form.Control
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="formTelefone" className="mb-3">
            <Form.Label>Telefone</Form.Label>
            <Form.Control
              type="text"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formEmail" className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formEndereco" className="mb-3">
            <Form.Label>Endereço</Form.Label>
            <Form.Control
              type="text"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formCpfCnpj" className="mb-3">
            <Form.Label>CPF/CNPJ</Form.Label>
            <Form.Control
              type="text"
              value={cpfCnpj}
              onChange={(e) => setCpfCnpj(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formObservacao" className="mb-3">
            <Form.Label>Observação</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            <X size={16} /> Cancelar
          </Button>
          <Button variant="primary" type="submit">
            <Save size={16} /> {action === 'create' ? 'Salvar' : 'Atualizar'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CadastroFornecedorModal;