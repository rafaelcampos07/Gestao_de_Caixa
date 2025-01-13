import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ShoppingCart, Trash2, Search, DollarSign, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Produto, ItemVenda, Venda, Funcionario, Cliente } from '../types';

export function PDV() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]); // Estado para clientes
  const [loading, setLoading] = useState(true);
  const [carrinho, setCarrinho] = useState<ItemVenda[]>([]);
  const [buscaProduto, setBuscaProduto] = useState('');
  const [buscaCliente, setBuscaCliente] = useState(''); // Estado para busca de clientes
  const [formaPagamento, setFormaPagamento] = useState<Venda['forma_pagamento']>('dinheiro');
  const [descontoPorcentagem, setDescontoPorcentagem] = useState<string>('');
  const [descontoDinheiro, setDescontoDinheiro] = useState<string>('');
  const [valorRecebido, setValorRecebido] = useState<number | null>(null);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState<string>('');
  const [dataLimitePagamento, setDataLimitePagamento] = useState<string>(''); // Para a data limite de pagamento
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null); // Estado para cliente selecionado

  const [novoProduto, setNovoProduto] = useState({
    nome: '',
    preco: null,
    quantidade: 1
  });

  useEffect(() => {
    carregarProdutos();
    carregarFuncionarios();
    carregarClientes(); // Carregar clientes ao iniciar
  }, []);

  const carregarProdutos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser  ();
      
      if (!user) {
        toast.error('Usuário não autenticado');
        return;
      }

      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const carregarFuncionarios = async () => {
    try {
      const { data, error } = await supabase.from('funcionarios').select('*');
      if (error) throw error;
      setFuncionarios(data || []);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
      toast.error('Erro ao carregar funcionários');
    }
  };

  const carregarClientes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser  ();
      
      if (!user) {
        toast.error('Usuário não autenticado');
        return;
      }

      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('user_id', user.id); // Filtra clientes pelo user_id

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast.error('Erro ao carregar clientes');
    }
  };

  const adicionarAoCarrinho = (produto: Produto, quantidade: number = 1) => {
    const item = carrinho.find(i => i.produto.id === produto.id);

    // Verifica se há estoque suficiente apenas para produtos não avulsos
    if (!produto.avulso) {
      const quantidadeDisponivel = item ? produto.estoque - item.quantidade : produto.estoque;
      if (quantidade > quantidadeDisponivel) {
        toast.error(`Quantidade indisponível. Disponível no estoque: ${quantidadeDisponivel}`);
        return;
      }
    }

    const subtotal = quantidade * (produto.preco || 0); // Certifique-se de que produto.preco não é null

    if (item) {
      setCarrinho(carrinho .map(i => 
        i.produto.id === produto.id
          ? { ...i, quantidade: i.quantidade + quantidade, subtotal: (i.quantidade + quantidade) * (produto.preco || 0) }
          : i
      ));
    } else {
      setCarrinho([...carrinho, { produto, quantidade, subtotal }]);
    }
  };

  const removerDoCarrinho = (produtoId: string) => {
    setCarrinho(carrinho.filter(i => i.produto.id !== produtoId));
  };

  const total = carrinho.reduce((acc, item) => acc + (item.subtotal || 0), 0);

  const handleDescontoPorcentagemChange = (value: string) => {
    setDescontoPorcentagem(value);
    const porcentagem = value ? parseFloat(value) : null;
    setDescontoDinheiro(porcentagem ? ((total * porcentagem) / 100).toFixed(2) : '');
  };

  const handleDescontoDinheiroChange = (value: string) => {
    setDescontoDinheiro(value);
    const dinheiro = value ? parseFloat(value) : null;
    setDescontoPorcentagem(dinheiro ? ((dinheiro / total) * 100).toFixed(2) : '');
  };

  const totalComDesconto = descontoDinheiro ? total - parseFloat(descontoDinheiro) : (descontoPorcentagem ? total - (total * parseFloat(descontoPorcentagem)) / 100 : total);
  const troco = valorRecebido !== null ? valorRecebido - totalComDesconto : 0;

const formatarDataISO = (data) => {
  return data.toISOString().slice(0, 19).replace('T', ' '); // Formato: YYYY-MM-DD HH:MM:SS
};


const finalizarVenda = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser ();
    
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    if (carrinho.length === 0) {
      toast.error('Adicione produtos ao carrinho');
      return;
    }

    if (!funcionarioSelecionado) {
      toast.error('Selecione um funcionário');
      return;
    }

  const dataAtual = new Date();
const venda = {
  items: carrinho,
  total: totalComDesconto,
  forma_pagamento: formaPagamento,
  desconto_dinheiro: descontoDinheiro ? parseFloat(descontoDinheiro) : 0,
  desconto_porcentagem: descontoPorcentagem ? parseFloat(descontoPorcentagem) : 0,
  data: formatarDataISO(dataAtual), // Use o formato ISO
  finalizada: true,
  user_id: user.id,
  funcionario_id: funcionarioSelecionado,
  cliente_id: clienteSelecionado ? clienteSelecionado.id : null,
  data_limite_pagamento: formaPagamento === 'aprazo' ? formatarDataISO(new Date(dataLimitePagamento)) : null, // Formato ISO
  divida_ativa: formaPagamento === 'aprazo',
};

    const { error: vendaError } = await supabase.from('vendas').insert([venda]);
    if (vendaError) throw vendaError;

    for (const item of carrinho) {
      if (!item.produto.avulso) {
        const { data: produtoAtualizado, error: produtoError } = await supabase
          .from('produtos')
          .select('estoque')
          .eq('id', item.produto.id)
          .single();

        if (produtoError) throw produtoError;

        const novoEstoque = produtoAtualizado.estoque - item.quantidade;

        const { error: updateError } = await supabase
          .from('produtos')
          .update({ estoque: novoEstoque })
          .eq('id', item.produto.id);

        if (updateError) throw updateError;
      }
    }

    toast.success('Venda finalizada com sucesso!');
    setCarrinho([]);
    setDescontoPorcentagem('');
    setDescontoDinheiro('');
    setFormaPagamento('dinheiro');
    setFuncionarioSelecionado('');
    setValorRecebido(null);
    setDataLimitePagamento('');
    setClienteSelecionado(null); // Resetando o cliente selecionado
    carregarProdutos();
  } catch (error) {
    console.error('Erro ao finalizar venda:', error);
    toast.error('Erro ao finalizar venda');
  }
};

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="card p-4">
        <div className="space-y-4 mb-4">
          <div className="card 
          p-4 border-2 border-indigo-100">
            <h3 className="font-medium text-gray-900 mb-3">Produto Avulso</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={novoProduto.nome}
                onChange={(e) => setNovoProduto(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Nome do produto"
                className="input-field"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={novoProduto.preco ?? ''}
                  onChange={(e) =>
                    setNovoProduto((prev) => ({
                      ...prev,
                      preco: e.target.value ? parseFloat(e.target.value) : null,
                    }))
                  }
                  placeholder="Preço"
                  className="input-field"
                />
                <input
                  type="number"
                  min="1"
                  value={novoProduto.quantidade}
                  onChange={(e) => setNovoProduto(prev => ({ ...prev, quantidade: parseInt(e.target.value) }))}
                  placeholder="Qtd"
                  className="input-field w-24"
                />
              </div>
              <button 
                onClick={() => {
                  if (!novoProduto.nome || novoProduto.preco <= 0) {
                    toast.error('Preencha o nome e o preço do produto');
                    return;
                  }
                  const produtoAvulso: Produto = {
                    id: `temp-${Date.now()}`,
                    nome: novoProduto.nome,
                    preco: novoProduto.preco,
                    descricao: '',
                    codigo: '',
                    estoque: 0,
                    avulso: true // Identifica o produto como avulso
                  };
                  adicionarAoCarrinho(produtoAvulso, novoProduto.quantidade);
                  setNovoProduto({ nome: '', preco: null, quantidade: 1 });
                }} 
                className="btn-primary w-full"
              >
                <Plus size={20} />
                Adicionar ao Carrinho
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={buscaProduto}
              onChange={(e) => setBuscaProduto(e.target.value)}
              placeholder="Buscar produto..."
              className="input-field flex-1"
            />
            <button className="btn-primary px-3">
              <Search size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {produtos
            .filter(p => p.nome.toLowerCase().includes(buscaProduto.toLowerCase()))
            .map(produto => (
              <button
                key={produto.id}
                onClick={() => adicionarAoCarrinho(produto)}
                className="p-3 rounded-lg border-2 border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors text-left"
              >
                <div className="font-medium text-gray-900">{produto.nome}</div>
                <div className="text-indigo-600 font-medium">
                  R$ {produto.preco.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">
                  Estoque: {produto.estoque}
                </div>
              </button>
            ))}
        </div>
      </div>

      <div className="card p-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ShoppingCart className="text-indigo-600" />
          Carrinho
        </h2>

        <div className="space-y-2 mb-4">
          {carrinho.map(item => (
            <div key={item.produto.id} className="flex justify-between items-center p-3 rounded-lg border-2 border-gray-200 bg-gray-50">
              <div>
                <div className="font-medium text-gray-900">{item.produto.nome}</div>
                <div className="text-sm text-gray-600">
                  {item.quantidade}x R$ {(item.produto.preco || 0).toFixed(2)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="font-medium text-indigo-600">
                  R$ {item.subtotal.toFixed(2)}
                </div>
                <button
                  onClick={() => removerDoCarrinho(item.produto.id)}
                  className="p-1.5 text-red-600 hover:bg-red -50 rounded-lg transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={buscaCliente}
            onChange={(e) => setBuscaCliente(e.target.value)}
            placeholder="Buscar cliente..."
            className="input-field flex-1"
          />
          <button className="btn-primary px-3">
            <Search size={20} />
          </button>
        </div>

        <div className="space-y-2">
          {buscaCliente && clientes
            .filter(cliente => cliente.nome.toLowerCase().includes(buscaCliente.toLowerCase()))
            .map(cliente => (
              <div key={cliente.id} className="p-3 rounded-lg border-2 border-gray-200 bg-gray-50 cursor-pointer" onClick={() => setClienteSelecionado(cliente)}>
                <div className="font-medium text-gray-900">{cliente.nome}</div>
                <div className="text-sm text-gray-600">CPF: {cliente.cpf}</div>
              </div>
            ))}
        </div>

        {clienteSelecionado && (
          <div className="mt-4 p-3 rounded-lg border-2 border-green-200 bg-green-50">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium text-gray-900">Cliente Selecionado:</div>
                <div className="text-sm text-gray-600">{clienteSelecionado.nome}</div>
              </div>
              <button
                onClick={() => setClienteSelecionado(null)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3 mb-4">
          <select
            value={formaPagamento}
            onChange={(e) => setFormaPagamento(e.target.value as Venda['forma_pagamento'])}
            className="input-field"
          >
            <option value="dinheiro">Dinheiro</option>
            <option value="pix">PIX</option>
            <option value="debito">Cartão de Débito</option>
            <option value="credito">Cartão de Crédito</option>
            <option value="aprazo">A Prazo</option>
          </select>

          {formaPagamento === 'aprazo' && (
            <input
              type="date"
              value={dataLimitePagamento}
              onChange={(e) => setDataLimitePagamento(e.target.value)}
              className="input-field"
              required
            />
          )}

          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              value={descontoPorcentagem}
              onChange={(e) => handleDescontoPorcentagemChange(e.target.value)}
              placeholder="Desconto (%)"
              className="input-field"
            />
            <input
              type="number"
              step="0.01"
              value={descontoDinheiro}
              onChange={(e) => handleDescontoDinheiroChange(e.target.value)}
              placeholder="Desconto (R$)"
              className="input-field"
            />
          </div>

          {formaPagamento === 'dinheiro' && (
            <input
              type="number"
              step="0.01"
              value={valorRecebido ?? ''}
              onChange={(e) => setValorRecebido(e.target.value ? parseFloat(e.target.value) : null)}
              placeholder="Valor Recebido"
              className="input-field"
            />
          )}

          <select
            value={funcionarioSelecionado}
            onChange={(e) => setFuncionarioSelecionado(e.target.value)}
            className="input-field"
          >
            <option value="">Selecione um funcionário</option>
            {funcionarios.map(funcionario => (
              <option key={funcionario.id} value={funcionario.id}>
                {funcionario.nome}
              </option>
            ))}
          </select> 
        </div>

        <div className="text-2xl font-semibold text-gray-900 mb-4 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Total:</span>
          <span>R$ {totalComDesconto.toFixed(2)}</span>
        </div>

        {formaPagamento === 'dinheiro' && valorRecebido !== null && valorRecebido >= totalComDesconto && (
          <div className="text-2xl font-semibold text-red-600 mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Troco:</span>
            <span>R$ {troco.toFixed(2)}</span>
          </div>
        )}

        <button onClick={finalizarVenda} className="btn-primary w-full">
          <DollarSign />
          Finalizar Venda
        </button>
      </div>
    </div>
  );
}