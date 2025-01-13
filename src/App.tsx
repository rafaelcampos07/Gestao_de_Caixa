import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { supabase } from './lib/supabase';
import toast, { Toaster } from 'react-hot-toast';
import { LoginPage } from './components/LoginPage';
import { CadastroProduto } from './components/CadastroProduto';
import { PDV } from './components/PDV';
import { RelatorioVendas } from './components/RelatorioVendas';
import { CadastroFuncionario } from './components/CadastroFuncionario';
import { CadastroFornecedor } from './components/CadastroFornecedor';
import { ResetPasswordPage } from './components/ResetPasswordPage';
import Watermark from './components/Watermark';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import { Package, ShoppingCart, ShoppingBag, Users, LogOut } from 'lucide-react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, useMediaQuery, Toolbar } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { CadastroCliente } from './components/CadastroCliente';

import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './index.css';

function App() {
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState('pdv');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Erro ao sair');
    } else {
      setSession(null);
      toast.success('Desconectado com sucesso');
    }
    setIsLogoutModalOpen(false);
  };

  const handleDelete = async () => {
    if (currentProductId) {
      try {
        const { error } = await supabase.from('produtos').delete().eq('id', currentProductId);
        if (error) throw error;
        toast.success('Produto excluído com sucesso!');
        if (tab === 'produtos') {
          setTab('pdv');
          setTimeout(() => setTab('produtos'), 0);
        }
      } catch (error) {
        toast.error('Erro ao excluir produto');
      } finally {
        setIsDeleteModalOpen(false);
        setCurrentProductId(null);
      }
    }
  };

  const openDeleteModal = (id: string) => {
    setCurrentProductId(id);
    setIsDeleteModalOpen(true);
  };

  const drawerContent = (
    <div>
      <Toolbar>
        {/* Substituindo o título por uma logo */}
        <div className="app-bar-logo">
          <img 
  src="https://i.imgur.com/Djaqtr2.png"  // Este é o link direto para a imagem do Imgur
  alt="Logo RCS Azul"
  className="w-104 h-34" 
/>

        </div>
      </Toolbar>
      <List>
 {[
  { key: 'produtos', label: 'Produtos', icon: <Package /> },
  { key: 'fornecedores', label: 'Fornecedores', icon: <ShoppingBag /> },
  { key: 'funcionarios', label: 'Funcionários', icon: <Users /> },
  { key: 'clientes', label: 'Clientes', icon: <Users /> }, // Adicionando a aba Clientes
  { key: 'pdv', label: 'PDV', icon: <ShoppingCart /> },
  { key: 'vendas', label: 'Vendas', icon: <ShoppingBag /> },
].map((item) => (
  <ListItem
    button
    key={item.key}
    onClick={() => setTab(item.key)}
    sx={{
      backgroundColor: tab === item.key ? '#6366f1' : 'transparent',
      color: tab === item.key ? '#fff' : '#cbd5e1',
      fontWeight: tab === item.key ? 'bold' : 'normal',
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        backgroundColor: '#4f46e5',
        color: '#fff',
        transform: 'scale(1.02)', // Leve zoom
      },
      '&:hover .MuiListItemIcon-root': {
        transform: 'scale(1.2)', // Ícone aumenta ao passar o mouse
        transition: 'transform 0.3s ease-in-out',
      },
    }}
  >
    <ListItemIcon
      className="MuiListItemIcon-root"
      sx={{
        color: tab === item.key ? '#fff' : '#cbd5e1',
        transition: 'transform 0.3s ease-in-out',
      }}
    >
      {item.icon}
    </ListItemIcon>
    <ListItemText primary={item.label} />
  </ListItem>
))}

        <ListItem button onClick={() => setIsLogoutModalOpen(true)}>
          <ListItemIcon sx={{ color: '#fff' }}>
            <LogOut />
          </ListItemIcon>
          <ListItemText primary="Sair" sx={{ color: '#fff' }} />
        </ListItem>
      </List>
    </div>
  );

  return (
    <>
      {session ? (
        <Router>
          <div className="flex">
            <Drawer
              variant={isMobile ? 'temporary' : 'permanent'}
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              sx={{
                '& .MuiDrawer-paper': {
                  boxSizing: 'border-box',
                  width: 240,
                  backgroundColor: '#4f46e5',
                },
              }}
            >
              {drawerContent}
            </Drawer>
            <div
              className="flex-grow"
              style={{
                marginLeft: isMobile ? 0 : 240,
              }}
            >
              <main className="p-4">
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
                <Routes>
                  <Route
                    path="/"
                    element={
                      <>
                        {tab === 'produtos' && <CadastroProduto openModal={openDeleteModal} />}
                        {tab === 'fornecedores' && <CadastroFornecedor />}
                        {tab === 'funcionarios' && <CadastroFuncionario />}
                        {tab === 'clientes' && <CadastroCliente />}
                        {tab === 'pdv' && <PDV />}
                        {tab === 'vendas' && <RelatorioVendas />}
                      </>
                    }
                  />
                  <Route path="/update-password" element={<ResetPasswordPage />} />
                </Routes>
              </main>
              <Watermark />
              <ConfirmDeleteModal
                show={isDeleteModalOpen}
                handleClose={() => setIsDeleteModalOpen(false)}
                handleConfirm={handleDelete}
                message="Tem certeza que deseja excluir este produto?"
              />
            </div>
          </div>
        </Router>
      ) : (
        <LoginPage />
      )}
      <ConfirmDeleteModal
        show={isLogoutModalOpen}
        handleClose={() => setIsLogoutModalOpen(false)}
        handleConfirm={handleLogout}
        message="Tem certeza que deseja sair do sistema?"
      />
    </>
  );
}

export default App;
