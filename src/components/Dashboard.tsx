import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { AiOutlineDollarCircle, AiOutlineShoppingCart } from 'react-icons/ai';
import { FaMoneyBillWave, FaCreditCard, FaMoneyCheckAlt } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie } from 'recharts';

export function Dashboard() {
  const [vendas, setVendas] = useState([]);
  const [produtosMaisVendidos, setProdutosMaisVendidos] = useState([]);
  const [produtosMenosVendidos, setProdutosMenosVendidos] = useState([]);
  const [clientesComMaisCompras, setClientesComMaisCompras] = useState([]);
  const [desempenhoFuncionarios, setDesempenhoFuncionarios] = useState([]);
  const [dividasAtivas, setDividasAtivas] = useState(0);
  const [estoqueCritico, setEstoqueCritico] = useState([]);
  const [receitaMensal, setReceitaMensal] = useState(0);
  const [valoresAReceber, setValoresAReceber] = useState(0);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dadosGraficos, setDadosGraficos] = useState({
    receitas: [],
    produtosMaisVendidos: [],
    produtosMenosVendidos: [],
    clientesMaisCompras: [],
    desempenhoFuncionarios: [],
  });

  useEffect(() => {
    carregarDados();
  }, [startDate, endDate]); // Recarregar dados quando as datas mudarem

  const carregarDados = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser ();
      if (!user) {
        toast.error('Usuário não autenticado');
        return;
      }

      // Carregar dados das tabelas principais filtrando pelo user_id
      let queryVendas = supabase.from('vendas').select('*').eq('user_id', user.id);
      if (startDate && endDate) {
        queryVendas = queryVendas.gte('data', startDate.toISOString()).lte('data', endDate.toISOString());
      }

      const { data: vendasData, error: vendasError } = await queryVendas;
      if (vendasError) throw new Error(vendasError.message || 'Erro ao carregar vendas');

      const { data: produtosData, error: produtosError } = await supabase.from('produtos').select('*').eq('user_id', user.id);
      if (produtosError) throw new Error(produtosError.message || 'Erro ao carregar produtos');

      const { data: clientesData, error: clientesError } = await supabase.from('clientes').select('*').eq('user_id', user.id);
      if (clientesError) throw new Error(clientesError.message || 'Erro ao carregar clientes');

      const { data: funcionariosData, error: funcionariosError } = await supabase.from('funcionarios').select('*').eq('user_id', user.id);
      if (funcionariosError) throw new Error(funcionariosError.message || 'Erro ao carregar funcionários');

      setVendas(vendasData || []);
      calcularReceitaMensal(vendasData || []);
      calcularValoresAReceber(vendasData || []);
      calcularProdutosMaisVendidos(vendasData || []);
      calcularProdutosMenosVendidos(vendasData || []);
      calcularClientesComMaisCompras(vendasData || [], clientesData || []);
      calcularDesempenhoFuncionarios(vendasData || [], funcionariosData || []);
      calcularDividasAtivas(clientesData || []);
      calcularEstoqueCritico(produtosData || []);
      calcularDadosGraficos(vendasData || []); // Adicionando a função para calcular dados para gráficos
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error(`Erro ao carregar dados: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const calcularReceitaMensal = (vendas) => {
    const receita = vendas.reduce(( acc, venda) => {
      if (venda.forma_pagamento !== 'aprazo') {
        acc += venda.total;
      }
      return acc;
    }, 0);
    setReceitaMensal(receita);
  };

  const calcularValoresAReceber = (vendas) => {
    const totalAReceber = vendas.reduce((acc, venda) => {
      if (venda.divida_ativa) {
        acc += venda.total;
      }
      return acc;
    }, 0);
    setValoresAReceber(totalAReceber);
  };

  const calcularProdutosMaisVendidos = (vendas) => {
    const contagem = {};
    vendas.forEach(venda => {
      if (venda.items) {
        venda.items.forEach(item => {
          const produtoNome = item.produto.nome;
          contagem[produtoNome] = (contagem[produtoNome] || 0) + item.quantidade;
        });
      }
    });
    const produtosOrdenados = Object.keys(contagem)
      .map(nome => ({ nome, quantidade: contagem[nome] }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10);
    setProdutosMaisVendidos(produtosOrdenados);
  };

  const calcularProdutosMenosVendidos = (vendas) => {
    const contagem = {};
    vendas.forEach(venda => {
      if (venda.items) {
        venda.items.forEach(item => {
          const produtoNome = item.produto.nome;
          contagem[produtoNome] = (contagem[produtoNome] || 0) + item.quantidade;
        });
      }
    });
    const produtosOrdenados = Object.keys(contagem)
      .map(nome => ({ nome, quantidade: contagem[nome] }))
      .sort((a, b) => a.quantidade - b.quantidade)
      .slice(0, 10);
    setProdutosMenosVendidos(produtosOrdenados);
  };

  const calcularClientesComMaisCompras = (vendas, clientes) => {
    const contagem = {};
    vendas.forEach(venda => {
      contagem[venda.cliente_id] = (contagem[venda.cliente_id] || 0) + 1;
    });
    const clientesOrdenados = Object.keys(contagem)
      .map(id => ({ id, quantidade: contagem[id] }))
      .sort((a, b) => b.quantidade - a.quantidade);
    const clientesComMaisCompras = clientesOrdenados.map(item => {
      const cliente = clientes.find(c => c.id === item.id);
      return cliente ? { nome: cliente.nome, quantidade: item.quantidade } : { nome: 'Avulso', quantidade: item.quantidade };
    });
    setClientesComMaisCompras(clientesComMaisCompras);
  };

  const calcularDesempenhoFuncionarios = (vendas, funcionarios) => {
    const desempenho = {};
    vendas.forEach(venda => {
      desempenho[venda.funcionario_id] = (desempenho[venda.funcionario_id] || 0) + venda.total;
    });
    const desempenhoArray = Object.keys(desempenho).map(id => {
      const funcionario = funcionarios.find(f => f.id === id);
      return funcionario ? { nome: funcionario.nome, total: desempenho[id] } : { nome: 'Desconhecido', total: desempenho[id] };
    });
    setDesempenhoFuncionarios(desempenhoArray);
  };

  const calcularDividasAtivas = (clientes) => {
    const totalDividasAtivas = clientes.filter(cliente => cliente.divida_ativa).length;
    setDividasAtivas(totalDividasAtivas);
  };

  const calcularEstoqueCritico = (produtos) => {
    const estoqueBaixo = produtos.filter(produto => produto.estoque < 5);
    setEstoqueCritico(estoqueBaixo);
  };

  const calcularDadosGraficos = (vendas) => {
    const receitas = {};
    const produtosMaisVendidos = {};
    const produtosMenosVendidos = {};
    const clientesMaisCompras = {};
    const desempenhoFuncionarios = {};

    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    for (let i = 0; i < 3; i++) {
      const mes = (mesAtual - i + 12) % 12;
      const ano = anoAtual - Math.floor((mesAtual - i) / 12);
      const chave = `${mes + 1}/${ano}`;
      receitas[chave] = 0;
      produtosMaisVendidos[chave] = {};
      produtosMenosVendidos[chave] = {};
      clientesMaisCompras[chave] = {};
      desempenhoFuncionarios[chave] = {};
    }

    vendas.forEach(venda => {
      const dataVenda = new Date(venda.data);
      const mesVenda = dataVenda.getMonth();
      const anoVenda = dataVenda.getFullYear();
      const chave = `${mesVenda + 1}/${anoVenda}`;

      if (receitas[chave] !== undefined) {
        receitas[chave] += venda.total;

        if (venda.items) {
          venda.items.forEach(item => {
            const produtoNome = item.produto.nome;
            produtosMaisVendidos[chave][produtoNome] = (produtosMaisVendidos[chave][produtoNome] || 0) + item.quantidade;
            produtosMenosVendidos[chave][produtoNome] = (produtosMenosVendidos[chave][produtoNome] || 0) + item.quantidade;
          });
        }

        const clienteId = venda.cliente_id;
        clientesMaisCompras[chave][clienteId] = (clientesMaisCompras[chave][clienteId] || 0) + 1;

        const funcionarioId = venda.funcionario_id;
        desempenhoFuncionarios[chave][funcionarioId] = (desempenhoFuncionarios[chave][funcionarioId] || 0) + venda.total;
      }
    });

    setDadosGraficos({
      receitas: Object.entries(receitas).map(([key, value]) => ({ mes: key, total: value })),
      produtosMaisVendidos: Object.entries(produtosMaisVendidos).map(([key, value]) => ({
        mes: key,
        produtos: Object.entries(value).map(([nome, quantidade]) => ({ nome, quantidade }))
      })),
      produtosMenosVendidos: Object.entries(produtosMenosVendidos).map(([key, value]) => ({
        mes: key,
        produtos: Object.entries(value).map(([nome, quantidade]) => ({ nome, quantidade }))
      })),
      clientesMaisCompras: Object.entries(clientesMaisCompras).map(([key, value]) => ({
        mes: key,
        clientes: Object.entries(value).map(([id, quantidade]) => ({ id, quantidade }))
      })),
      desempenhoFuncionarios: Object.entries(desempenhoFuncionarios).map(([key, value]) => ({
        mes: key,
        funcionarios: Object.entries(value).map(([id, total]) => ({ id, total }))
      })),
    });
  };

  const limparFiltros = () => {
    setStartDate(null);
    setEndDate(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex mb-4">
        <DatePicker selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          placeholderText="Data Inicial"
          className="border p-2 rounded mr-2"
        />
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          placeholderText="Data Final"
          className="border p-2 rounded mr-2"
        />
        <button onClick={carregarDados} className="bg-blue-500 text-white p-2 rounded mr-2">Filtrar</button>
        <button onClick={limparFiltros} className="bg-gray-500 text-white p-2 rounded">Limpar Filtro</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white shadow-md rounded-lg p-4 flex items-center">
          <AiOutlineDollarCircle size={40} className="text-indigo-600 mr-4" />
          <div>
            <h3 className="text-lg font-bold">Receita Mensal</h3>
            <p>R$ {receitaMensal.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-4 flex items-center">
          <AiOutlineShoppingCart size={40} className="text-green-600 mr-4" />
          <div>
            <h3 className="text-lg font-bold">Produtos Mais Vendidos</h3>
            <p>{produtosMaisVendidos.map(produto => (
              <div key={produto.nome}>{produto.nome}: {produto.quantidade}</div>
            ))}</p>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-4 flex items-center">
          <AiOutlineShoppingCart size={40} className="text-red-600 mr-4" />
          <div>
            <h3 className="text-lg font-bold">Produtos Menos Vendidos</h3>
            <p>{produtosMenosVendidos.map(produto => (
              <div key={produto.nome}>{produto.nome}: {produto.quantidade}</div>
            ))}</p>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-4 flex items-center">
          <FaMoneyBillWave size={40} className="text-blue-600 mr-4" />
          <div>
            <h3 className="text-lg font-bold">Clientes com Mais Compras</h3>
            <p>{clientesComMaisCompras.map(cliente => (
              <div key={cliente.nome}>{cliente.nome}: {cliente.quantidade}</div>
            ))}</p>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-4 flex items-center">
          <FaCreditCard size={40} className="text-purple-600 mr-4" />
          <div>
            <h3 className="text-lg font-bold">Desempenho Funcionários</h3>
            <p>{desempenhoFuncionarios.map(funcionario => (
              <div key={funcionario.nome}>{funcionario.nome}: R$ {funcionario.total.toFixed(2)}</div>
            ))}</p>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-4 flex items-center">
          <FaMoneyCheckAlt size={40} className="text-red-600 mr-4" />
          <div>
            <h3 className="text-lg font-bold">Dívidas Ativas</h3>
            <p>Total de clientes com dívidas ativas: {dividasAtivas}</p>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-4 flex items-center">
          <AiOutlineShoppingCart size={40} className="text-yellow-600 mr-4" />
          <div>
            <h3 className="text-lg font-bold">Estoque Crítico</h3>
            <ul>
              {estoqueCritico.map((produto) => (
                <li key={produto.id}>{produto.nome} - Estoque: {produto.estoque}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-4 flex items-center">
          <AiOutlineDollarCircle size={40} className="text-orange-600 mr-4" />
          <div>
            <h3 className="text-lg font-bold">Valores a Receber</h3>
            <p>R$ {valoresAReceber.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-4 mt-4">
        <h3 className="text-lg font-bold">Comparativo de Receita</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dadosGraficos.receitas}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {dadosGraficos.produtosMaisVendidos.map((data, index) => (
        <div key={index} className="bg-white shadow-md rounded-lg p-4 mt-4">
          <h3 className="text-lg font-bold">Produtos Mais Vendidos - {data.mes}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.produtos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantidade" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ))}

      {dadosGraficos.produtosMenosVendidos.map((data, index) => (
        
        <div key={index} className="bg-white shadow-md rounded-lg p-4 mt-4">
          <h3 className="text-lg font-bold">Produtos Menos Vendidos - {data.mes}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.produtos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantidade" fill="#ff7300" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ))}

      {dadosGraficos.clientesMaisCompras.map((data, index) => (
        <div key={index} className="bg-white shadow-md rounded-lg p-4 mt-4">
          <h3 className="text-lg font-bold">Clientes com Mais Compras - {data.mes}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={data.clientes} dataKey="quantidade" nameKey="id" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ))}

      {dadosGraficos.desempenhoFuncionarios.map((data, index) => (
        <div key={index} className="bg-white shadow-md rounded-lg p-4 mt-4">
          <h3 className="text-lg font-bold">Desempenho Funcionários - {data.mes}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.funcionarios}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;