import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Toaster } from 'react-hot-toast';
import { LoginPage } from './components/LoginPage';
import { CadastroProduto } from './components/CadastroProduto';
import { PDV } from './components/PDV';
import { RelatorioVendas } from './components/RelatorioVendas';
import { Header } from './components/Header';
import Watermark from './components/Watermark';


import { Package, ShoppingCart, BarChart } from 'lucide-react';

function App() {
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState('pdv');

<main className="flex-grow max-w-7xl mx-auto p-4 pb-8">
  {tab === 'produtos' && <CadastroProduto />}
  {tab === 'pdv' && <PDV />}
  {tab === 'relatorio' && <RelatorioVendas />}
</main>



  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return (
      <>
        <LoginPage />
        <Watermark />
      </>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#fff',
            color: '#333',
            borderRadius: '0.75rem',
            border: '1px solid #e5e7eb',
          },
        }}
      />

      <Header />

      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex h-16">
            <div className="flex space-x-8">
              <button
                onClick={() => setTab('produtos')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  tab === 'produtos'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Package className="mr-2" size={20} />
                Produtos
              </button>
              <button
                onClick={() => setTab('pdv')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  tab === 'pdv'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <ShoppingCart className="mr-2" size={20} />
                PDV
              </button>
              <button
                onClick={() => setTab('relatorio')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  tab === 'relatorio'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart className="mr-2" size={20} />
                Relatório
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto p-4">
        {tab === 'produtos' && <CadastroProduto />}
        {tab === 'pdv' && <PDV />}
        {tab === 'relatorio' && <RelatorioVendas />}
      </main>

      <Watermark />
    </div>
  );
}

export default App;