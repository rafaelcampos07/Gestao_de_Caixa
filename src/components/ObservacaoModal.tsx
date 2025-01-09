import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { X } from 'lucide-react';

interface ObservacaoModalProps {
  show: boolean;
  handleClose: () => void;
  observacao: string | null;
}

const ObservacaoModal: React.FC<ObservacaoModalProps> = ({ show, handleClose, observacao }) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Observações</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{observacao || 'Nenhuma observação disponível.'}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          <X size={16} /> Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ObservacaoModal;
