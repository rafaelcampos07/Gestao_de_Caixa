// src/components/ConfirmDeleteModal.tsx
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface ConfirmDeleteModalProps {
  show: boolean;
  handleClose: () => void;
  handleConfirm: () => void;
  message: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ show, handleClose, handleConfirm, message }) => {
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirmação</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{message}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={handleConfirm}>
          Confirmar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmDeleteModal;