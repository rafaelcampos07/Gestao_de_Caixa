import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { supabase } from '../lib/supabase'; // Certifique-se de que o caminho está correto
import toast from 'react-hot-toast';
import { Save, X } from 'lucide-react'; // Importando ícones
import type { Fornecedor } from '../types';

interface CadastroFornecedorModalProps {
  show: boolean;
  handleClose: () => void;
  carregarFornecedores: () => void;
  fornecedorInicial: { nome: string; telefone: string; email: string; endereco: string } | null; // Permitir que seja null
  editingId?: string | null;
}

const CadastroFornecedorModal: React.FC<CadastroFornecedorModalProps> = ({
  show,
  handleClose,
  carregarFornecedores,
  fornecedorInicial,
  editingId,
}) => {
  const [nome, setNome] = useState(fornecedorInicial?.nome || ''); // Usar valor padrão
  const [telefone, setTelefone] = useState(fornecedorInicial?.telefone || ''); // Usar valor padrão
  const [email, setEmail] = useState(fornecedorInicial?.email || ''); // Usar valor padrão
  const [endereco, setEndereco] = useState(fornecedorInicial?.endereco || ''); // Usar valor padrão
  const [action, setAction] = useState(editingId ? 'edit' : 'create');

  useEffect(() => {
    if (fornecedorInicial) {
      setNome(fornecedorInicial.nome);
      setTelefone(fornecedorInicial.telefone);
      setEmail(fornecedorInicial.email);
      setEndereco(fornecedorInicial.endereco);
    }
  }, [fornecedorInicial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser ();
      if (userError || !user) {
        toast.error('Erro ao obter usuário autenticado');
        return;
      }
      const userId = user.id; // Armazene o userId

      // Verifique se o nome está preenchido
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
            user_id: userId, // Passando userId corretamente
            created_at: new Date().toISOString(),
          },
        ]);
        if (error) {
          console.error('Erro ao inserir fornecedor:', error); // Log de erro
          throw error;
        }
        toast.success('Fornecedor criado com sucesso!');
      } else if (action === 'edit' && editingId) {
        const { error } = await supabase
          .from('fornecedores')
          .update({ nome, telefone, email, endereco })
          .eq('id', editingId);
        if (error) {
          console.error('Erro ao atualizar fornecedor:', error); // Log de erro
          throw error;
        }
        toast.success('Fornecedor atualizado com sucesso!');
      }
      carregarFornecedores();
      handleClose(); // Fecha o modal após a operação
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
              //placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required // Campo obrigatório
            />
          </Form.Group>

          <Form.Group controlId="formTelefone" className="mb-3">
            <Form .Label>Telefone</Form.Label>
            <Form.Control
              type="text"
              //placeholder="Telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formEmail" className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              //placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formEndereco" className="mb-3">
            <Form.Label>Endereço</Form.Label>
            <Form.Control
              type="text"
             // placeholder="Endereço"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
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