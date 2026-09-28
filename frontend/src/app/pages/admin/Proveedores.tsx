import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/button';
import { Plus, Edit2, Trash2, Truck, Phone, FileText } from 'lucide-react';
import { toast } from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';
import { Input } from '../../components/ui/input';
import { API_URL } from '../../context/AuthContext';

interface Proveedor {
  idProveedor: number;
  ruc: string;
  nombreProveedor: string;
  telefono: string;
  productos?: any[]; // Lo dejamos preparado para cuando creemos Producto
}

interface ProveedorForm {
  ruc: string;
  nombreProveedor: string;
  telefono: string;
}

const proveedorInicial: ProveedorForm = {
  ruc: '',
  nombreProveedor: '',
  telefono: '',
};

export const Proveedores = () => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [proveedorEditando, setProveedorEditando] = useState<Proveedor | null>(null);
  const [formData, setFormData] = useState<ProveedorForm>(proveedorInicial);

  useEffect(() => {
    cargarProveedores();
  }, []);

  const cargarProveedores = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/proveedores`, {
        credentials: 'include',
      });

      if (res.status === 401) {
        toast.error('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
        window.location.href = '/iniciar-sesion';
        return;
      }

      if (!res.ok) throw new Error('No se pudo cargar los proveedores');
      
      const data = await res.json();
      setProveedores(data);
    } catch (error) {
      toast.error('Error al cargar proveedores');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const eliminar = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/proveedores/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.status === 401) {
        window.location.href = '/iniciar-sesion';
        return;
      }

      if (!res.ok) throw new Error('Error al eliminar');

      await cargarProveedores();
      toast.success('Proveedor eliminado');
    } catch (error) {
      toast.error('Error al eliminar proveedor. Revisa que no tenga productos asociados.');
      console.error(error);
    }
  };

  const abrirModal = (proveedor?: Proveedor) => {
    if (proveedor) {
      setProveedorEditando(proveedor);
      setFormData({
        ruc: proveedor.ruc,
        nombreProveedor: proveedor.nombreProveedor,
        telefono: proveedor.telefono,
      });
    } else {
      setProveedorEditando(null);
      setFormData(proveedorInicial);
    }
    setModalAbierto(true);
  };

  const guardar = async () => {
    // Validaciones preventivas
    if (!formData.ruc.trim() || formData.ruc.length !== 11) {
      toast.error('El RUC debe tener exactamente 11 caracteres');
      return;
    }

    if (!formData.nombreProveedor.trim()) {
      toast.error('El nombre del proveedor no puede estar vacío');
      return;
    }

    if (!formData.telefono.trim()) {
      toast.error('El teléfono es obligatorio');
      return;
    }

    const payload = {
      ruc: formData.ruc.trim(),
      nombreProveedor: formData.nombreProveedor.trim(),
      telefono: formData.telefono.trim(),
    };

    try {
      const url = proveedorEditando
        ? `${API_URL}/api/proveedores/${proveedorEditando.idProveedor}`
        : `${API_URL}/api/proveedores`;
      
      const method = proveedorEditando ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        window.location.href = '/iniciar-sesion';
        return;
      }

      // Manejo específico si el backend rechaza porque el RUC ya existe
      if (res.status === 409 || res.status === 400) {
        toast.error('Error al guardar. Es posible que el RUC ya esté registrado.');
        return;
      }

      if (!res.ok) throw new Error('Error al guardar');

      await cargarProveedores();
      toast.success(proveedorEditando ? 'Proveedor actualizado' : 'Proveedor creado');
      setModalAbierto(false);
      setProveedorEditando(null);
      setFormData(proveedorInicial);
    } catch (error) {
      toast.error('Ocurrió un error inesperado al guardar');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-2 text-foreground">Proveedores</h2>
          <p className="text-muted-foreground">Gestiona tus proveedores de productos</p>
        </div>
        <Button variant="accent" onClick={() => abrirModal()} className="gap-2">
          <Plus size={18} />
          Nuevo Proveedor
        </Button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Cargando proveedores...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {proveedores.map((proveedor) => (
            <Card key={proveedor.idProveedor} hover>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                      <Truck size={20} className="text-accent" />
                    </div>
                    <div>
                      <h4 className="text-card-foreground line-clamp-1">{proveedor.nombreProveedor}</h4>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <FileText size={12} className="text-muted-foreground" />
                        <span>RUC: {proveedor.ruc}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone size={14} className="text-accent" />
                    <span>{proveedor.telefono}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2">Productos suministrados:</p>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-1 bg-primary/20 text-primary rounded text-xs">
                      {proveedor.productos ? proveedor.productos.length : 0} productos asociados
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="flex-1 gap-2" onClick={() => abrirModal(proveedor)}>
                    <Edit2 size={14} />
                    Editar
                  </Button>
                  <Button variant="destructive" size="sm" className="gap-2" onClick={() => eliminar(proveedor.idProveedor)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog.Root open={modalAbierto} onOpenChange={setModalAbierto}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl">
            <Dialog.Title className="mb-6 text-card-foreground">
              {proveedorEditando ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </Dialog.Title>

            <div className="space-y-4">
              <Input 
                label="RUC" 
                placeholder="Ej: 20123456789" 
                maxLength={11}
                value={formData.ruc}
                onChange={(e) => setFormData({ ...formData, ruc: e.target.value.replace(/\D/g, '') })} // Solo permite números
              />
              <Input 
                label="Nombre del proveedor" 
                placeholder="Lubricantes del Perú S.A.C." 
                value={formData.nombreProveedor}
                onChange={(e) => setFormData({ ...formData, nombreProveedor: e.target.value })}
              />
              <Input 
                label="Teléfono" 
                placeholder="Ej: 987654321" 
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="ghost" className="flex-1" onClick={() => setModalAbierto(false)}>
                Cancelar
              </Button>
              <Button variant="accent" className="flex-1" onClick={guardar}>
                Guardar
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};