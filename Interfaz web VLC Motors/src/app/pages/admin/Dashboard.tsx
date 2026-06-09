import { useState } from 'react';
import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';
import { Users, Wrench, Package, Tag, Folder, Truck, History, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { GestionUsuarios } from './GestionUsuarios';
import { Servicios } from './Servicios';
import { Productos } from './Productos';
import { Ofertas } from './Ofertas';
import { Categorias } from './Categorias';
import { Proveedores } from './Proveedores';
import { HistorialStock } from './HistorialStock';
import { Reportes } from './Reportes';

type View = 'usuarios' | 'servicios' | 'productos' | 'ofertas' | 'categorias' | 'proveedores' | 'historial' | 'reportes';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<View>('reportes');

  const sidebarItems = [
    { name: 'Reportes', icon: BarChart3, path: '/admin' },
    { name: 'Gestión de Usuarios', icon: Users, path: '/admin/usuarios' },
    { name: 'Servicios', icon: Wrench, path: '/admin/servicios' },
    { name: 'Productos', icon: Package, path: '/admin/productos' },
    { name: 'Ofertas', icon: Tag, path: '/admin/ofertas' },
    { name: 'Categorías', icon: Folder, path: '/admin/categorias' },
    { name: 'Proveedores', icon: Truck, path: '/admin/proveedores' },
    { name: 'Historial de Stock', icon: History, path: '/admin/historial' },
  ];

  const handleNavigation = (path: string) => {
    if (path === '/admin') setCurrentView('reportes');
    else if (path === '/admin/usuarios') setCurrentView('usuarios');
    else if (path === '/admin/servicios') setCurrentView('servicios');
    else if (path === '/admin/productos') setCurrentView('productos');
    else if (path === '/admin/ofertas') setCurrentView('ofertas');
    else if (path === '/admin/categorias') setCurrentView('categorias');
    else if (path === '/admin/proveedores') setCurrentView('proveedores');
    else if (path === '/admin/historial') setCurrentView('historial');
  };

  const renderView = () => {
    switch (currentView) {
      case 'usuarios':
        return <GestionUsuarios />;
      case 'servicios':
        return <Servicios />;
      case 'productos':
        return <Productos />;
      case 'ofertas':
        return <Ofertas />;
      case 'categorias':
        return <Categorias />;
      case 'proveedores':
        return <Proveedores />;
      case 'historial':
        return <HistorialStock />;
      case 'reportes':
        return <Reportes />;
      default:
        return <Reportes />;
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
