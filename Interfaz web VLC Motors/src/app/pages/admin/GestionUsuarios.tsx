import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Plus, Trash2, User, Shield, Wrench, Filter } from 'lucide-react';
import { toast } from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';
import { API_URL } from '../../context/AuthContext';

export const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  
  // NUEVO ESTADO: Controla qué rol estamos filtrando (1=Admin, 2=Trabajador, 3=Cliente, 'todos'=Sin filtro)
  const [filtroActivo, setFiltroActivo] = useState<number | 'todos'>('todos');
  
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', email: '', contrasenia: '', rol: 3,
    telefono: '', direccion: '', placaMototaxi: '', marcaMototaxi: '', modeloMototaxi: '',
    especialidad: '', disponibilidad: true, nivelAcceso: 1
  });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/usuarios`, { credentials: 'include' });
      if (res.status === 401) {
        window.location.href = '/iniciar-sesion';
        return;
      }
      if (!res.ok) throw new Error('Error al cargar');
      setUsuarios(await res.json());
    } catch (error) {
      toast.error('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const eliminarUsuario = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/usuarios/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.status === 401) return (window.location.href = '/iniciar-sesion');
      if (!res.ok) throw new Error('Error');
      await cargarUsuarios();
      toast.success('Usuario eliminado');
    } catch (error) {
      toast.error('No se pudo eliminar. Verifique dependencias.');
    }
  };

  const abrirModal = () => {
    setFormData({
      nombre: '', apellido: '', email: '', contrasenia: '', rol: 3,
      telefono: '', direccion: '', placaMototaxi: '', marcaMototaxi: '', modeloMototaxi: '',
      especialidad: '', disponibilidad: true, nivelAcceso: 1
    });
    setModalAbierto(true);
  };

  const guardarUsuario = async () => {
    try {
      let endpoint = '';
      if (formData.rol === 1) endpoint = '/api/usuarios/admin';
      if (formData.rol === 2) endpoint = '/api/usuarios/trabajador';
      if (formData.rol === 3) endpoint = '/api/usuarios/cliente';

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (res.status === 401) return (window.location.href = '/iniciar-sesion');
      if (!res.ok) throw new Error('Error al crear el usuario');

      await cargarUsuarios();
      toast.success('Usuario creado correctamente');
      setModalAbierto(false);
    } catch (error) {
      toast.error('Ocurrió un error al guardar los datos');
    }
  };

  const getRolUI = (rolId: number) => {
      if (rolId === 1) return { 
        text: 'Admin', 
        icon: <Shield size={20} className="text-amber-700 dark:text-accent" />, 
        badge: 'bg-amber-100 text-amber-800 dark:bg-accent/20 dark:text-accent' 
      };
      if (rolId === 2) return { 
        text: 'Trabajador', 
        icon: <Wrench size={20} className="text-green-700 dark:text-green-500" />, 
        badge: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400' 
      };
      return { 
        text: 'Cliente', 
        icon: <User size={20} className="text-blue-700 dark:text-blue-500" />, 
        badge: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400' 
      };
    };

  // NUEVA LÓGICA: Calculamos los usuarios filtrados antes de dibujarlos
  const usuariosFiltrados = usuarios.filter(usuario => {
    if (filtroActivo === 'todos') return true;
    return usuario.rol === filtroActivo;
  });

  return (
    <div className="space-y-6">
      {/* CABECERA ACTUALIZADA CON LOS BOTONES DE FILTRO */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="mb-2 text-foreground">Gestión de Usuarios</h2>
          <p className="text-muted-foreground">Administra clientes, trabajadores y administradores</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Panel de botones de filtro */}
          <div className="flex bg-card border border-border p-1 rounded-lg">
            <Button 
              variant={filtroActivo === 'todos' ? 'secondary' : 'ghost'} 
              size="sm" 
              onClick={() => setFiltroActivo('todos')}
              className="text-xs"
            >
              Todos
            </Button>
            <Button 
              variant={filtroActivo === 1 ? 'secondary' : 'ghost'} 
              size="sm" 
              onClick={() => setFiltroActivo(1)}
              className="text-xs gap-1"
            >
              <Shield size={14}/> Admins
            </Button>
            <Button 
              variant={filtroActivo === 2 ? 'secondary' : 'ghost'} 
              size="sm" 
              onClick={() => setFiltroActivo(2)}
              className="text-xs gap-1"
            >
              <Wrench size={14}/> Trabajadores
            </Button>
            <Button 
              variant={filtroActivo === 3 ? 'secondary' : 'ghost'} 
              size="sm" 
              onClick={() => setFiltroActivo(3)}
              className="text-xs gap-1"
            >
              <User size={14}/> Clientes
            </Button>
          </div>

          <Button variant="accent" onClick={abrirModal} className="gap-2">
            <Plus size={18} />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground p-8">Cargando usuarios...</div>
      ) : usuariosFiltrados.length === 0 ? (
        <div className="text-center text-muted-foreground p-12 bg-card border border-border rounded-xl">
          <Filter size={40} className="mx-auto mb-3 opacity-20" />
          <p>No se encontraron usuarios para este filtro.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* USAMOS EL ARREGLO FILTRADO AQUÍ */}
          {usuariosFiltrados.map((usuario) => {
            const ui = getRolUI(usuario.rol);
            return (
              <Card key={usuario.idUsuario} hover>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        {ui.icon}
                      </div>
                      <div>
                        <h4 className="text-card-foreground line-clamp-1">{usuario.nombre} {usuario.apellido}</h4>
                        <p className="text-xs text-muted-foreground">{usuario.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {usuario.rol === 3 && <p className="text-sm text-muted-foreground">Tel: {usuario.telefono}</p>}
                    {usuario.rol === 2 && <p className="text-sm text-muted-foreground">{usuario.especialidad}</p>}
                    
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${ui.badge}`}>
                      {ui.text}
                    </span>
                  </div>

                  <div className="flex justify-end mt-4">
                    <Button variant="destructive" size="sm" onClick={() => eliminarUsuario(usuario.idUsuario)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog.Root open={modalAbierto} onOpenChange={setModalAbierto}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <Dialog.Title className="mb-6 text-card-foreground text-xl font-bold">Nuevo Usuario</Dialog.Title>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
                <Input label="Apellido" value={formData.apellido} onChange={(e) => setFormData({ ...formData, apellido: e.target.value })} />
              </div>
              <Input label="Correo electrónico" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              <Input label="Contraseña temporal" type="password" value={formData.contrasenia} onChange={(e) => setFormData({ ...formData, contrasenia: e.target.value })} />

              <div>
                <label className="block text-sm mb-2 text-foreground font-medium">Asignar Rol</label>
                <select
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value={3}>Cliente (Acceso a mis citas)</option>
                  <option value={2}>Trabajador (Acceso a agenda operativa)</option>
                  <option value={1}>Administrador (Acceso total)</option>
                </select>
              </div>

              {formData.rol === 3 && (
                <div className="p-4 bg-muted/50 rounded-lg space-y-4 border border-border">
                  <h4 className="text-sm font-semibold text-foreground">Datos del Cliente y Vehículo</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Teléfono" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} />
                    <Input label="Placa Mototaxi" value={formData.placaMototaxi} onChange={(e) => setFormData({ ...formData, placaMototaxi: e.target.value })} />
                  </div>
                  <Input label="Dirección" value={formData.direccion} onChange={(e) => setFormData({ ...formData, direccion: e.target.value })} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Marca" value={formData.marcaMototaxi} onChange={(e) => setFormData({ ...formData, marcaMototaxi: e.target.value })} />
                    <Input label="Modelo" value={formData.modeloMototaxi} onChange={(e) => setFormData({ ...formData, modeloMototaxi: e.target.value })} />
                  </div>
                </div>
              )}

              {formData.rol === 2 && (
                <div className="p-4 bg-muted/50 rounded-lg space-y-4 border border-border">
                  <h4 className="text-sm font-semibold text-foreground">Datos Laborales</h4>
                  <Input label="Especialidad (Ej: Motor, Eléctrico)" value={formData.especialidad} onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })} />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <Button variant="ghost" className="flex-1" onClick={() => setModalAbierto(false)}>Cancelar</Button>
              <Button variant="accent" className="flex-1" onClick={guardarUsuario}>Guardar</Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};