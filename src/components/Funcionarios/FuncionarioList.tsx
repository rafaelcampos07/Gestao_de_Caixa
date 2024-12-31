import React from 'react';
import { Trash2, Edit2 } from 'lucide-react';
import type { Funcionario } from '../../types';

interface FuncionarioListProps {
  funcionarios: Funcionario[];
  onEdit: (funcionario: Funcionario) => void;
  onDelete: (id: string) => void;
}

export function FuncionarioList({ funcionarios, onEdit, onDelete }: FuncionarioListProps) {
  if (funcionarios.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhum funcionário cadastrado
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {funcionarios.map(funcionario => (
        <div 
          key={funcionario.id} 
          className="flex justify-between items-center p-4 bg-white rounded-lg border-2 border-gray-100"
        >
          <div>
            <h3 className="font-medium text-gray-900">{funcionario.nome}</h3>
            <div className="text-sm text-gray-500">
              {funcionario.funcao && <span className="mr-4">{funcionario.funcao}</span>}
              {funcionario.email && <span className="mr-4">{funcionario.email}</span>}
              {funcionario.celular && <span>{funcionario.celular}</span>}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(funcionario)}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit2 size={20} />
            </button>
            <button
              onClick={() => onDelete(funcionario.id)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}