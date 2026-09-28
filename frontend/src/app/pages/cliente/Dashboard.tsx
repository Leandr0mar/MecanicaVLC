import { useState } from 'react';
import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';
import { Calendar, ShoppingBag, CalendarCheck, Package, Star } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ReservarCita } from './ReservarCita';
import { ReservarProductos } from './ReservarProductos';
import { MisCitas } from './MisCitas';
import { MisPedidos } from './MisPedidos';
import { Reseñas } from './Reseñas';

type View = 'reservar-cita' | 'reservar-productos' | 'mis-citas' | 'mis-pedidos' | 'reseñas';

export const ClienteDashboard = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<View>('reservar-cita');

  const sidebarItems = [
    { name: 'Reservar Cita', icon: Calendar, path: '/cliente' },
    { name: 'Reservar Productos', icon: ShoppingBag, path: '/cliente/productos' },
    { name: 'Mis Citas', icon: CalendarCheck, path: '/cliente/citas' },
    { name: 'Mis Pedidos', icon: Package, path: '/cliente/pedidos' },
    { name: 'Reseñas', icon: Star, path: '/cliente/reseñas' },
  ];

  const handleNavigation = (path: string) => {
    if (path === '/cliente') setCurrentView('reservar-cita');
    else if (path === '/cliente/productos') setCurrentView('reservar-productos');
    else if (path === '/cliente/citas') setCurrentView('mis-citas');
    else if (path === '/cliente/pedidos') setCurrentView('mis-pedidos');
    else if (path === '/cliente/reseñas') setCurrentView('reseñas');
  };

  const renderView = () => {
    switch (currentView) {
      case 'reservar-cita':
        return <ReservarCita />;
      case 'reservar-productos':
        return <ReservarProductos />;
      case 'mis-citas':
        return <MisCitas />;
      case 'mis-pedidos':
        return <MisPedidos />;
      case 'reseñas':
        return <Reseñas />;
      default:
        return <ReservarCita />;
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
