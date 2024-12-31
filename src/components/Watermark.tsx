import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const Watermark: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white text-center py-1 text-sm w-full flex items-center justify-center space-x-2">
      <span>&copy; 2024 Gestão de Caixa. By Rafael Campos.</span>
      <div className="flex items-center space-x-1">
        <FaWhatsapp className="w-4 h-4 text-green-500" />
        <span>34998394436</span>
      </div>
    </footer>
  );
};

export default Watermark;