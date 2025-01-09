import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface InformacoesModalProps {
  show: boolean;
  handleClose: () => void;
  title: string;
  content: React.ReactNode;
}

const InformacoesModal: React.FC<InformacoesModalProps> = ({ show, handleClose, title, content }) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {content}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default InformacoesModal;