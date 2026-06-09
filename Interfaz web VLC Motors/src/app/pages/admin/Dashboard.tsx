import { useState, useEffect } from 'react';
import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';
import { Users, Wrench, Package, Tag, Folder, Truck, History, BarChart3, Calendar } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router'; // <-- Añadimos useLocation
import { GestionUsuarios } from './GestionUsuarios';
import { Servicios } from './Servicios';
import { Productos } from './Productos';
import { Ofertas } from './Ofertas';
import { Categorias } from './Categorias';
import { Proveedores } from './Proveedores';
import { HistorialStock } from './HistorialStock';
import { Reportes } from './Reportes';
import { GestionCitas } from './GestionCitas';

type View = 'usuarios' | 'servicios' | 'productos' | 'ofertas' | 'categorias' | 'proveedores' | 'historial' | 'reportes' | 'citas';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation(); // <-- Hook para leer la URL actual
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
    { name: 'Gestión de Citas', icon: Calendar, path: '/admin/citas' },
  ];

  // NUEVA LÓGICA: Sincroniza la URL con la vista automáticamente al cargar o navegar
  useEffect(() => {
    const path = location.pathname;
    if (path === '/admin/usuarios') setCurrentView('usuarios');
    else if (path === '/admin/servicios') setCurrentView('servicios');
    else if (path === '/admin/productos') setCurrentView('productos');
    else if (path === '/admin/ofertas') setCurrentView('ofertas');
    else if (path === '/admin/categorias') setCurrentView('categorias');
    else if (path === '/admin/proveedores') setCurrentView('proveedores');
    else if (path === '/admin/historial') setCurrentView('historial');
    else if (path === '/admin/citas') setCurrentView('citas');
    else setCurrentView('reportes'); // fallback por defecto
  }, [location.pathname]);

  const handleNavigation = (path: string) => {
    // En lugar de cambiar el estado a mano, le decimos a React Router que cambie la URL.
    // Al cambiar la URL, el useEffect de arriba detectará el cambio y actualizará la vista automáticamente.
    navigate(path);
  };

  const renderView = () => {
    switch (currentView) {
      case 'usuarios': return <GestionUsuarios />;
      case 'servicios': return <Servicios />;
      case 'productos': return <Productos />;
      case 'ofertas': return <Ofertas />;
      case 'categorias': return <Categorias />;
      case 'proveedores': return <Proveedores />;
      case 'historial': return <HistorialStock />;
      case 'reportes': return <Reportes />;
      case 'citas': return <GestionCitas />;
      default: return <Reportes />;
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