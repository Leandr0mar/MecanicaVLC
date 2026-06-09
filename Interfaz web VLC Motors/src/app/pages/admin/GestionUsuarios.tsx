import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Plus, Edit2, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  rol: 'cliente' | 'trabajador' | 'admin';
}

const usuariosIniciales: Usuario[] = [
  { id: 1, nombre: 'Juan Pérez', email: 'juan@example.com', telefono: '+51 987 654 321', rol: 'cliente' },
  { id: 2, nombre: 'Carlos López', email: 'carlos@example.com', telefono: '+51 912 345 678', rol: 'trabajador' },
  { id: 3, nombre: 'María García', email: 'maria@example.com', telefono: '+51 998 765 432', rol: 'trabajador' },
  { id: 4, nombre: 'Admin VLC', email: 'admin@vlc.com', telefono: '+51 987 123 456', rol: 'admin' },
];

export const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState(usuariosIniciales);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);

  const eliminarUsuario = (id: number) => {
    setUsuarios(usuarios.filter((u) => u.id !== id));
    toast.success('Usuario eliminado');
  };

  const abrirModal = (usuario?: Usuario) => {
    setUsuarioEditando(usuario || null);
    setModalAbierto(true);
  };

  const guardarUsuario = () => {
    toast.success(usuarioEditando ? 'Usuario actualizado' : 'Usuario creado');
    setModalAbierto(false);
    setUsuarioEditando(null);
  };

  const getRolBadge = (rol: string) => {
    const config = {
      cliente: 'bg-blue-500/20 text-blue-400',
      trabajador: 'bg-green-500/20 text-green-400',
      admin: 'bg-accent/20 text-accent',
    };
    return config[rol as keyof typeof config] || config.cliente;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-2 text-foreground">Gestión de Usuarios</h2>
          <p className="text-muted-foreground">Administra clientes, trabajadores y administradores</p>
        </div>
        <Button variant="accent" onClick={() => abrirModal()} className="gap-2">
          <Plus size={18} />
          Nuevo Usuario
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {usuarios.map((usuario) => (
          <Card key={usuario.id} hover>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                    <User size={20} className="text-accent" />
                  </div>
                  <div>
                    <h4 className="text-card-foreground">{usuario.nombre}</h4>
                    <p className="text-xs text-muted-foreground">{usuario.email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-muted-foreground">{usuario.telefono}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getRolBadge(usuario.rol)}`}>
                  {usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1)}
                </span>
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="flex-1 gap-2" onClick={() => abrirModal(usuario)}>
                  <Edit2 size={14} />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                  onClick={() => eliminarUsuario(usuario.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog.Root open={modalAbierto} onOpenChange={setModalAbierto}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl">
            <Dialog.Title className="mb-6 text-card-foreground">
              {usuarioEditando ? 'Editar Usuario' : 'Nuevo Usuario'}
            </Dialog.Title>

            <div className="space-y-4">
              <Input label="Nombre completo" placeholder="Juan Pérez" defaultValue={usuarioEditando?.nombre} />
              <Input label="Correo electrónico" type="email" placeholder="juan@example.com" defaultValue={usuarioEditando?.email} />
              <Input label="Teléfono" placeholder="+51 987 654 321" defaultValue={usuarioEditando?.telefono} />

              <div>
                <label className="block text-sm mb-2 text-foreground">Rol</label>
                <select
                  defaultValue={usuarioEditando?.rol || 'cliente'}
                  className="w-full px-4 py-2.5 bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="cliente">Cliente</option>
                  <option value="trabajador">Trabajador</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="ghost" className="flex-1" onClick={() => setModalAbierto(false)}>
                Cancelar
              </Button>
              <Button variant="accent" className="flex-1" onClick={guardarUsuario}>
                Guardar
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};
