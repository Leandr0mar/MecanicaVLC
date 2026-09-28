import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
  productos?: any[];
}

interface ProveedorFormData {
  ruc: string;
  nombreProveedor: string;
  telefono: string;
}

export const Proveedores = () => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [proveedorEditando, setProveedorEditando] = useState<Proveedor | null>(null);

  // React Hook Form con estrategia profesional onBlur + onChange
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProveedorFormData>({
    mode: 'onBlur',             // No interrumpe mientras el usuario escribe; valida al salir del campo
    reValidateMode: 'onChange', // Limpia el error al instante en cuanto el valor es corregido
    defaultValues: {
      ruc: '',
      nombreProveedor: '',
      telefono: '',
    },
  });

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
      toast.success('Proveedor eliminado correctamente');
    } catch (error) {
      toast.error('No se pudo eliminar el proveedor. Verifique que no tenga repuestos vinculados.');
      console.error(error);
    }
  };

  const abrirModal = (proveedor?: Proveedor) => {
    setProveedorEditando(proveedor ?? null);

    // Inicializa o precarga el formulario con valores limpios
    reset({
      ruc: proveedor?.ruc ?? '',
      nombreProveedor: proveedor?.nombreProveedor ?? '',
      telefono: proveedor?.telefono ?? '',
    });

    setModalAbierto(true);
  };

  const onSubmit = async (data: ProveedorFormData) => {
    setGuardando(true);

    const payload = {
      ruc: data.ruc.trim(),
      nombreProveedor: data.nombreProveedor.trim(),
      telefono: data.telefono.trim(),
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

      if (res.status === 409 || res.status === 400) {
        const errorData = await res.json().catch(() => null);
        toast.error(errorData?.error || 'El número de RUC ya se encuentra registrado en el sistema.');
        return;
      }

      if (!res.ok) {
        throw new Error('Error al guardar los datos del proveedor');
      }

      await cargarProveedores();
      toast.success(proveedorEditando ? 'Proveedor actualizado correctamente' : 'Proveedor registrado exitosamente');
      setModalAbierto(false);
      setProveedorEditando(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ocurrió un error inesperado al guardar');
      console.error(error);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-2 text-foreground font-bold text-2xl">Proveedores</h2>
          <p className="text-muted-foreground text-sm">Gestiona distribuidores y fabricantes de repuestos</p>
        </div>
        <Button variant="accent" onClick={() => abrirModal()} className="gap-2">
          <Plus size={18} />
          Nuevo Proveedor
        </Button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Cargando proveedores...</div>
      ) : proveedores.length === 0 ? (
        <div className="text-center p-12 bg-card border border-border rounded-xl">
          <Truck size={40} className="mx-auto mb-3 opacity-20 text-muted-foreground" />
          <p className="text-muted-foreground font-medium">No hay proveedores registrados en la base de datos.</p>
        </div>
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
                      <h4 className="text-card-foreground font-semibold line-clamp-1">
                        {proveedor.nombreProveedor}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <FileText size={12} className="text-muted-foreground" />
                        <span className="font-mono">RUC: {proveedor.ruc}</span>
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
                    <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                      {proveedor.productos ? proveedor.productos.length : 0} productos asociados
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => abrirModal(proveedor)}
                    title="Editar proveedor"
                    aria-label={`Editar ${proveedor.nombreProveedor}`}
                  >
                    <Edit2 size={14} />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-2"
                    onClick={() => eliminar(proveedor.idProveedor)}
                    title="Eliminar proveedor"
                    aria-label={`Eliminar ${proveedor.nombreProveedor}`}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Dialog con validaciones React Hook Form */}
      <Dialog.Root open={modalAbierto} onOpenChange={setModalAbierto}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl">
            <Dialog.Title className="mb-6 text-card-foreground text-xl font-bold">
              {proveedorEditando ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </Dialog.Title>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              
              {/* RUC */}
              <Input
                label="RUC de la empresa *"
                placeholder="20123456789"
                inputMode="numeric"
                maxLength={11}
                error={errors.ruc?.message}
                {...register('ruc', {
                  required: 'El RUC no puede estar vacío',
                  pattern: {
                    value: /^\d{11}$/,
                    message: 'El RUC de la empresa en Perú debe tener exactamente 11 dígitos',
                  },
                })}
              />

              {/* Nombre del Proveedor */}
              <Input
                label="Razón Social / Proveedor *"
                placeholder="Lubricantes y Repuestos del Perú S.A.C."
                error={errors.nombreProveedor?.message}
                {...register('nombreProveedor', {
                  required: 'El nombre del proveedor no puede estar vacío',
                  maxLength: {
                    value: 150,
                    message: 'El nombre del proveedor no debe superar los 150 caracteres',
                  },
                  validate: (v) =>
                    v.trim().length > 0 || 'El nombre no puede consistir únicamente de espacios',
                })}
              />

              {/* Teléfono */}
              <Input
                label="Teléfono de contacto *"
                placeholder="987654321 o (01) 456-7890"
                inputMode="tel"
                maxLength={20}
                error={errors.telefono?.message}
                {...register('telefono', {
                  required: 'El teléfono no puede estar vacío',
                  maxLength: {
                    value: 20,
                    message: 'El teléfono no debe superar los 20 caracteres',
                  },
                  pattern: {
                    value: /^[+]?[0-9\s-]{6,20}$/,
                    message: 'Formato de teléfono o celular inválido',
                  },
                  validate: (v) =>
                    v.trim().length > 0 || 'El teléfono no puede consistir únicamente de espacios',
                })}
              />

              <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setModalAbierto(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  className="flex-1"
                  disabled={guardando}
                >
                  {guardando
                    ? 'Procesando...'
                    : proveedorEditando
                    ? 'Actualizar Proveedor'
                    : 'Guardar Proveedor'}
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};