import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery';
import { supabase } from '../../lib/supabase';
import { FuncionarioForm } from './FuncionarioForm';
import { FuncionarioList } from './FuncionarioList';
import type { Funcionario } from '../../types';
import toast from 'react-hot-toast';

export function Funcionarios() {
  const { user } = useAuth();
  const { executeQuery, loading } = useSupabaseQuery();
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [editingFuncionario, setEditingFuncionario] = useState<Funcionario | null>(null);

  useEffect(() => {
    if (user) {
      loadFuncionarios();
    }
  }, [user]);

  const loadFuncionarios = async () => {
    if (!user) return;

    const data = await executeQuery(() =>
      supabase
        .from('funcionarios')
        .select('*')
        .eq('user_id', user.id)
        .order('nome')
    );

    if (data) {
      setFuncionarios(data);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este funcionário?')) return;

    await executeQuery(
      () => supabase.from('funcionarios').delete().eq('id', id),
      {
        onSuccess: () => {
          toast.success('Funcionário excluído com sucesso');
          loadFuncionarios();
        }
      }
    );
  };

  if (loading && funcionarios.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">
          {editingFuncionario ? 'Editar Funcionário' : 'Novo Funcionário'}
        </h2>
        <FuncionarioForm
          onSuccess={() => {
            loadFuncionarios();
            setEditingFuncionario(null);
          }}
          editingFuncionario={editingFuncionario || undefined}
          onCancel={editingFuncionario ? () => setEditingFuncionario(null) : undefined}
        />
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">Funcionários</h2>
        <FuncionarioList
          funcionarios={funcionarios}
          onEdit={setEditingFuncionario}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}