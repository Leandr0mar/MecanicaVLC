import { useState } from 'react';
import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';
import { CalendarCheck, Clock, Package, Star } from 'lucide-react';
import { useNavigate } from 'react-router';
import { AgendaCitas } from './AgendaCitas';
import { GestionarCitas } from './GestionarCitas';
import { Pedidos } from './Pedidos';
import { Horarios } from './Horarios';
import { ReseñasTrabajador } from './ReseñasTrabajador';

type View = 'agenda' | 'gestionar' | 'pedidos' | 'horarios' | 'reseñas';

export const TrabajadorDashboard = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<View>('agenda');

  const sidebarItems = [
    { name: 'Agenda de Citas', icon: CalendarCheck, path: '/trabajador' },
    { name: 'Gestionar Citas', icon: Clock, path: '/trabajador/gestionar' },
    { name: 'Pedidos', icon: Package, path: '/trabajador/pedidos' },
    { name: 'Horarios', icon: Clock, path: '/trabajador/horarios' },
    { name: 'Reseñas', icon: Star, path: '/trabajador/reseñas' },
  ];

  const handleNavigation = (path: string) => {
    if (path === '/trabajador') setCurrentView('agenda');
    else if (path === '/trabajador/gestionar') setCurrentView('gestionar');
    else if (path === '/trabajador/pedidos') setCurrentView('pedidos');
    else if (path === '/trabajador/horarios') setCurrentView('horarios');
    else if (path === '/trabajador/reseñas') setCurrentView('reseñas');
  };

  const renderView = () => {
    switch (currentView) {
      case 'agenda':
        return <AgendaCitas />;
      case 'gestionar':
        return <GestionarCitas />;
      case 'pedidos':
        return <Pedidos />;
      case 'horarios':
        return <Horarios />;
      case 'reseñas':
        return <ReseñasTrabajador />;
      default:
        return <AgendaCitas />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <div onClick={(e) => {
        const target = e.target as HTMLElement;
        const link = target.closest('a');
        if (link) {
          e.preventDefault();
          handleNavigation(link.getAttribute('href') || '');
        }
      }}>
        <Sidebar items={sidebarItems} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden w-full lg:w-auto">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {renderView()}
        </main>
      </div>
    </div>
  );
};
