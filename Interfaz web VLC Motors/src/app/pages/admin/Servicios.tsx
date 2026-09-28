import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/ui/button';
import { Plus, Edit2, Trash2, Wrench, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';
import { Input } from '../../components/ui/input';
import { formatCurrency } from '../../utils/currency';
import { API_URL } from '../../context/AuthContext';

interface Servicio {
  id: number;
  nombre: string;
  duracion: string;
  precio: number;
  descripcion: string;
  duracionEstimadaMinutos: number;
}

interface ServicioFormData {
  nombreServicio: string;
  descripcionServicio: string;
  precioInicial: number;
  duracionEstimadaMinutos: number;
}

export const Servicios = () => {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [servicioEditando, setServicioEditando] = useState<Servicio | null>(null);
  const [guardando, setGuardando] = useState(false);

  // Configuración de validación reactiva profesional
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServicioFormData>({
    mode: 'onBlur',             // Valida al salir del input para no interrumpir la escritura
    reValidateMode: 'onChange', // Si quedó en error, limpia el mensaje inmediatamente al corregirse
    defaultValues: {
      nombreServicio: '',
      descripcionServicio: '',
      precioInicial: 0,
      duracionEstimadaMinutos: 30,
    },
  });

  const cargarServicios = async () => {
    try {
      const res = await fetch(`${API_URL}/api/servicios`, {
        credentials: 'include',
      });

      if (res.status === 401) {
        toast.error('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
        window.location.href = '/iniciar-sesion';
        return;
      }

      if (!res.ok) throw new Error('No se pudo cargar los servicios');

      const data = await res.json();

      const serviciosMapeados = data.map((item: any) => ({
        id: item.idServicio,
        nombre: item.nombreServicio,
        duracion: `${item.duracionEstimadaMinutos ?? 0} min`,
        precio: item.precioInicial ?? 0,
        descripcion: item.descripcionServicio,
        duracionEstimadaMinutos: item.duracionEstimadaMinutos ?? 0,
      }));

      setServicios(serviciosMapeados);
    } catch (error) {
      console.error(error);
      toast.error('No se pudieron cargar los servicios');
    }
  };

  useEffect(() => {
    cargarServicios();
  }, []);

  const eliminar = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/servicios/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.status === 401) {
        window.location.href = '/iniciar-sesion';
        return;
      }

      if (!res.ok) throw new Error('Error al eliminar');
      await cargarServicios();
      toast.success('Servicio eliminado');
    } catch (error) {
      console.error(error);
      toast.error('No se pudo eliminar el servicio');
    }
  };

  const abrirModal = (servicio?: Servicio) => {
    if (servicio) {
      setServicioEditando(servicio);
      reset({
        nombreServicio: servicio.nombre,
        descripcionServicio: servicio.descripcion,
        precioInicial: servicio.precio,
        duracionEstimadaMinutos: servicio.duracionEstimadaMinutos,
      });
    } else {
      setServicioEditando(null);
      reset({
        nombreServicio: '',
        descripcionServicio: '',
        precioInicial: 0,
        duracionEstimadaMinutos: 30,
      });
    }
    setModalAbierto(true);
  };

  const onSubmit = async (data: ServicioFormData) => {
    setGuardando(true);
    const payload = {
      nombreServicio: data.nombreServicio.trim(),
      descripcionServicio: data.descripcionServicio.trim(),
      precioInicial: Number(data.precioInicial),
      duracionEstimadaMinutos: Number(data.duracionEstimadaMinutos),
    };

    try {
      const url = servicioEditando
        ? `${API_URL}/api/servicios/${servicioEditando.id}`
        : `${API_URL}/api/servicios`;
      const method = servicioEditando ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        toast.error('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
        window.location.href = '/iniciar-sesion';
        return;
      }

      if (!res.ok) {
        const errorDetail = await res.text();
        console.error(`Error del servidor (Código ${res.status}):`, errorDetail);
        throw new Error(`Fallo en el servidor: ${res.status}`);
      }

      await cargarServicios();
      toast.success(servicioEditando ? 'Servicio actualizado' : 'Servicio creado');
      setModalAbierto(false);
      setServicioEditando(null);
    } catch (error) {
      console.error(error);
      toast.error('No se pudo guardar el servicio');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-2 text-foreground font-bold text-2xl">Servicios</h2>
          <p className="text-muted-foreground text-sm">Gestiona el catálogo de servicios mecánicos ofrecidos</p>
        </div>
        <Button variant="accent" onClick={() => abrirModal()} className="gap-2">
          <Plus size={18} />
          Nuevo Servicio
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-4 text-foreground">Servicio</th>
              <th className="text-left p-4 text-foreground">Duración</th>
              <th className="text-left p-4 text-foreground">Precio Base</th>
              <th className="text-left p-4 text-foreground">Descripción</th>
              <th className="text-right p-4 text-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {servicios.map((servicio) => (
              <tr key={servicio.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                      <Wrench size={18} className="text-accent" />
                    </div>
                    <span className="font-medium text-foreground">{servicio.nombre}</span>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground">{servicio.duracion}</td>
                <td className="p-4 text-accent font-semibold">{formatCurrency(servicio.precio)}</td>
                <td className="p-4 text-muted-foreground text-sm max-w-xs truncate">{servicio.descripcion}</td>
                <td className="p-4">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => abrirModal(servicio)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
                      title="Editar servicio"
                      aria-label={`Editar ${servicio.nombre}`}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => eliminar(servicio.id)}
                      className="p-2 hover:bg-destructive/20 rounded-lg transition-colors text-destructive"
                      title="Eliminar servicio"
                      aria-label={`Eliminar ${servicio.nombre}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Dialog con validaciones integradas */}
      <Dialog.Root open={modalAbierto} onOpenChange={setModalAbierto}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl">
            <Dialog.Title className="mb-6 text-card-foreground text-xl font-bold">
              {servicioEditando ? 'Editar Servicio' : 'Nuevo Servicio'}
            </Dialog.Title>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Input
                label="Nombre del servicio *"
                placeholder="Afinamiento de Motor"
                error={errors.nombreServicio?.message}
                {...register('nombreServicio', {
                  required: 'El nombre del servicio no puede estar vacío',
                  maxLength: {
                    value: 100,
                    message: 'El nombre del servicio no debe superar los 100 caracteres',
                  },
                  validate: (v) => v.trim().length > 0 || 'El nombre no puede consistir únicamente de espacios',
                })}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Duración (min) *"
                  type="number"
                  placeholder="45"
                  min={1}
                  error={errors.duracionEstimadaMinutos?.message}
                  {...register('duracionEstimadaMinutos', {
                    required: 'La duración estimada es obligatoria',
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message: 'La duración estimada debe ser mayor que cero',
                    },
                    validate: (v) => !isNaN(v) && v > 0 || 'La duración estimada debe ser mayor que cero',
                  })}
                />

                <Input
                  label="Precio base (S/.) *"
                  type="number"
                  step="0.50"
                  min={0}
                  placeholder="50.00"
                  error={errors.precioInicial?.message}
                  {...register('precioInicial', {
                    required: 'El precio inicial es obligatorio',
                    valueAsNumber: true,
                    min: {
                      value: 0,
                      message: 'El precio inicial debe ser cero o un valor positivo',
                    },
                    validate: (v) => !isNaN(v) && v >= 0 || 'El precio inicial debe ser cero o un valor positivo',
                  })}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="descripcionServicio" className="text-sm font-medium text-foreground">
                  Descripción del servicio *
                </label>
                <textarea
                  id="descripcionServicio"
                  rows={3}
                  placeholder="Detalla qué incluye este servicio (ej. afinamiento completo, cambio de bujía, limpieza de carburador)..."
                  className={`w-full px-4 py-2.5 bg-input-background border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-colors ${
                    errors.descripcionServicio ? 'border-destructive focus:ring-destructive' : 'border-input'
                  }`}
                  {...register('descripcionServicio', {
                    required: 'La descripción del servicio no puede estar vacía',
                    maxLength: {
                      value: 255,
                      message: 'La descripción no debe superar los 255 caracteres',
                    },
                    validate: (v) => v.trim().length > 0 || 'La descripción no puede estar compuesta solo de espacios',
                  })}
                />
                {errors.descripcionServicio && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-0.5">
                    <AlertCircle size={12} />
                    {errors.descripcionServicio.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3 mt-6 pt-2">
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
                    ? 'Guardando...'
                    : servicioEditando
                    ? 'Actualizar'
                    : 'Guardar'}
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};