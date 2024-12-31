import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import type { Funcionario } from '../../types';

interface FuncionarioFormProps {
  onSuccess: () => void;
  editingFuncionario?: Funcionario;
  onCancel?: () => void;
}

export function FuncionarioForm({ onSuccess, editingFuncionario, onCancel }: FuncionarioFormProps) {
  const { user } = useAuth();
  const { executeQuery } = useSupabaseQuery();
  const [formData, setFormData] = useState({
    nome: editingFuncionario?.nome || '',
    celular: editingFuncionario?.celular || '',
    email: editingFuncionario?.email || '',
    funcao: editingFuncionario?.funcao || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    const query = editingFuncionario
      ? supabase
          .from('funcionarios')
          .update(formData)
          .eq('id', editingFuncionario.id)
      : supabase
          .from('funcionarios')
          .insert([{ ...formData, user_id: user.id }]);

    await executeQuery(
      () => query,
      {
        onSuccess: () => {
          toast.success(
            editingFuncionario 
              ? 'Funcionário atualizado com sucesso' 
              : 'Funcionário cadastrado com sucesso'
          );
          onSuccess();
          setFormData({ nome: '', celular: '', email: '', funcao: '' });
        }
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
        <input
          type="text"
          value={formData.nome}
          onChange={e => setFormData(prev => ({ ...prev, nome: e.target.value }))}
          className="input-field"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Celular</label>
        <input
          type="tel"
          value={formData.celular}
          onChange={e => setFormData(prev => ({ ...prev, celular: e.target.value }))}
          className="input-field"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="input-field"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Função</label>
        <input
          type="text"
          value={formData.funcao}
          onChange={e => setFormData(prev => ({ ...prev, funcao: e.target.value }))}
          className="input-field"
        />
      </div>

      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1">
          {editingFuncionario ? 'Atualizar' : 'Cadastrar'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}