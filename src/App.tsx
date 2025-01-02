import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { supabase } from './lib/supabase';
import toast, { Toaster } from 'react-hot-toast';
import { LoginPage } from './components/LoginPage';
import { CadastroProduto } from './components/CadastroProduto';
import { PDV } from './components/PDV';
import { RelatorioVendas } from './components/RelatorioVendas';
import { CadastroFuncionario } from './components/CadastroFuncionario';
import { ResetPasswordPage } from './components/ResetPasswordPage';
import Watermark from './components/Watermark';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import { Package, ShoppingCart, BarChart, Users } from 'lucide-react';
import { AppBar, Toolbar, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Tabs, Tab, useMediaQuery, Typography, Divider, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { useTheme } from '@mui/material/styles';

import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Certifique-se de importar o FontAwesome aqui
import './index.css'; // Certifique-se de importar seu CSS personalizado

function App() {
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState('pdv'); // Definindo a aba principal como "PDV"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false); // Novo estado para controle do modal de logout

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
      setLogoutModalOpen(false); // Fechar o modal de logout após sair
    }
  };

  const handleCloseLogoutModal = () => {
    setLogoutModalOpen(false); // Fechar o modal de logout quando cancelar
  };

  const handleDelete = async () => {
    if (currentProductId) {
      try {
        const { error } = await supabase.from('produtos').delete().eq('id', currentProductId);
        if (error) throw error;
        toast.success('Produto excluído com sucesso!');
        // Recarregar produtos após exclusão
        if (tab === 'produtos') {
          setTab('pdv'); // Temporariamente mudar de aba para forçar recarregamento
          setTimeout(() => setTab('produtos'), 0); // Voltar para a aba de produtos
        }
      } catch (error) {
        toast.error('Erro ao excluir produto');
      } finally {
        setIsModalOpen(false);
        setCurrentProductId(null);
      }
    }
  };

  const openModal = (id: string) => {
    setCurrentProductId(id);
    setIsModalOpen(true);
  };

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const drawerContent = (
    <div
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        <ListItem button onClick={() => setTab('produtos')}>
          <ListItemIcon><Package /></ListItemIcon>
          <ListItemText primary="Produtos" />
        </ListItem>
        <ListItem button onClick={() => setTab('funcionarios')}>
          <ListItemIcon><Users /></ListItemIcon>
          <ListItemText primary="Funcionários" />
        </ListItem>
        <ListItem button onClick={() => setTab('pdv')}>
          <ListItemIcon><ShoppingCart /></ListItemIcon>
          <ListItemText primary="PDV" />
        </ListItem>
        <ListItem button onClick={() => setTab('relatorio')}>
          <ListItemIcon><BarChart /></ListItemIcon>
          <ListItemText primary="Relatório" />
        </ListItem>
      </List>
    </div>
  );

  if (!session) {
    return (
      <>
        <LoginPage />
        <Watermark />
      </>
    );
  }

  return (
    <Router>
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
        {isMobile ? (
          <>
            <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1, backgroundColor: '#4f46e5' }}>
              <Toolbar>
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  onClick={toggleDrawer(true)}
                >
                  <MenuIcon />
                </IconButton>
                <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
                  Gestão de Caixa
                </Typography>
                {session && session.user && (
                  <>
                    <Typography variant="body2" noWrap sx={{ marginRight: 2 }}>
                      {session.user.email}
                    </Typography>
                    <Button color="inherit" onClick={() => setLogoutModalOpen(true)} startIcon={<LogoutIcon />}>
                      Sair
                    </Button>
                  </>
                )}
              </Toolbar>
            </AppBar>
            <Drawer
              anchor="left"
              open={drawerOpen}
              onClose={toggleDrawer(false)}
              sx={{
                '& .MuiDrawer-paper': {
                  boxSizing: 'border-box',
                  width: 240,
                },
              }}
            >
              <Toolbar />
              <Divider />
              {drawerContent}
            </Drawer>
          </>
        ) : (
          <AppBar position="static" sx={{ backgroundColor: '#4f46e5' }}>
            <Toolbar>
              <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} textColor="inherit" indicatorColor="secondary" className="tabs-left">
                <Tab value="produtos" label="Produtos" icon={<Package />} iconPosition="start" />
                <Tab value="funcionarios" label="Funcionários" icon={<Users />} iconPosition="start" />
                <Tab value="pdv" label="PDV" icon={<ShoppingCart />} iconPosition="start" />
                <Tab value="relatorio" label="Relatório" icon={<BarChart />} iconPosition="start" />
              </Tabs>
              {session && session.user && (
                <>
                  <Typography variant="body2" noWrap sx={{ flexGrow: 1, textAlign: 'right', marginRight: 2 }}>
                    {session.user.email}
                  </Typography>
                  <Button color="inherit" onClick={() => setLogoutModalOpen(true)} startIcon={<LogoutIcon />}>
                    Sair
                  </Button>
                </>
              )}
            </Toolbar>
          </AppBar>
        )}

        <main className="flex-grow max-w-7xl mx-auto p-4">
          <Routes>
            <Route path="/" element={
              <>
                {tab === 'produtos' && <CadastroProduto openModal={openModal} />}
                {tab === 'pdv' && <PDV />}
                {tab === 'relatorio' && <RelatorioVendas />}
                {tab === 'funcionarios' && <CadastroFuncionario />}
              </>
            } />
            <Route path="/update-password" element={<ResetPasswordPage />} />
          </Routes>
        </main>

        <Watermark />

        <ConfirmDeleteModal
          show={isModalOpen}
          handleClose={() => setIsModalOpen(false)}
          handleConfirm={handleDelete}
          message="Tem certeza que deseja excluir este produto?"
        />

        {/* Modal de confirmação para logout */}
        <ConfirmDeleteModal
          show={logoutModalOpen}
          handleClose={handleCloseLogoutModal}
          handleConfirm={handleLogout}
          message="Tem certeza que deseja sair?"
        />
      </div>
    </Router>
  );
}

export default App;