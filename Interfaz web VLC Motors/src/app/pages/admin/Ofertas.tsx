import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/button';
import {
  Plus,
  Edit2,
  Trash2,
  Tag,
  Calendar,
  Package,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';
import { Input } from '../../components/ui/input';
import { API_URL } from '../../context/AuthContext';

interface Oferta {
  idOferta: number;
  titulo: string;
  descuento: number;
  fechaInicio: string;
  fechaFin: string;
  productos?: any[];
}

interface OfertaFormData {
  titulo: string;
  descuento: number;
  fechaInicio: string;
  fechaFin: string;
  productoId?: number;
}

export const Ofertas = () => {
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [productosDisponibles, setProductosDisponibles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [ofertaEditando, setOfertaEditando] = useState<Oferta | null>(null);

  // React Hook Form con estrategia profesional onBlur + onChange
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<OfertaFormData>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      titulo: '',
      descuento: 10,
      fechaInicio: '',
      fechaFin: '',
      productoId: 0,
    },
  });

  const fechaInicioWatch = watch('fechaInicio');

  useEffect(() => {
    cargarOfertas();
    cargarProductos();
  }, []);

  const cargarOfertas = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/ofertas`, { credentials: 'include' });
      if (res.status === 401) {
        toast.error('Tu sesión ha expirado');
        window.location.href = '/iniciar-sesion';
        return;
      }
      if (!res.ok) throw new Error('Error al cargar');
      setOfertas(await res.json());
    } catch {
      toast.error('Error al cargar las ofertas');
    } finally {
      setLoading(false);
    }
  };

  const cargarProductos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/productos`, { credentials: 'include' });
      if (res.ok) setProductosDisponibles(await res.json());
    } catch {
      // Ignora silenciosamente si el endpoint no está disponible
    }
  };

  const eliminar = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/ofertas/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.status === 401) {
        window.location.href = '/iniciar-sesion';
        return;
      }
      if (!res.ok) throw new Error('Error');
      await cargarOfertas();
      toast.success('Oferta eliminada correctamente');
    } catch {
      toast.error('No se pudo eliminar la oferta. Verifique si está asignada a productos.');
    }
  };

  const abrirModal = (oferta?: Oferta) => {
    setOfertaEditando(oferta ?? null);

    reset({
      titulo: oferta?.titulo ?? '',
      descuento: oferta?.descuento ?? 10,
      fechaInicio: oferta?.fechaInicio ?? '',
      fechaFin: oferta?.fechaFin ?? '',
      productoId: 0,
    });

    setModalAbierto(true);
  };

  const onSubmit = async (data: OfertaFormData) => {
    setGuardando(true);

    const payload = {
      titulo: data.titulo.trim(),
      descuento: Number(data.descuento),
      fechaInicio: data.fechaInicio,
      fechaFin: data.fechaFin,
    };

    try {
      const url = ofertaEditando
        ? `${API_URL}/api/ofertas/${ofertaEditando.idOferta}`
        : `${API_URL}/api/ofertas`;
      const method = ofertaEditando ? 'PUT' : 'POST';

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

      if (!res.ok) {
        const errorDetail = await res.json().catch(() => null);
        throw new Error(errorDetail?.error || 'No se pudo guardar la oferta');
      }

      await cargarOfertas();
      toast.success(ofertaEditando ? 'Oferta actualizada exitosamente' : 'Oferta creada exitosamente');
      setModalAbierto(false);
      setOfertaEditando(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar la oferta');
    } finally {
      setGuardando(false);
    }
  };

  // Determina el estado dinámico de la promoción
  const determinarEstado = (inicio: string, fin: string) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const dateInicio = new Date(`${inicio}T00:00:00`);
    const dateFin = new Date(`${fin}T00:00:00`);

    if (hoy < dateInicio) {
      return {
        texto: 'Programada',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400',
      };
    }
    if (hoy > dateFin) {
      return {
        texto: 'Expirada',
        color: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400',
      };
    }
    return {
      texto: 'Activa',
      color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400',
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-2 text-foreground font-bold text-2xl">Ofertas</h2>
          <p className="text-muted-foreground text-sm">Administra promociones y descuentos para el catálogo</p>
        </div>
        <Button variant="accent" onClick={() => abrirModal()} className="gap-2">
          <Plus size={18} />
          Nueva Oferta
        </Button>
      </div>

      {loading ? (
        <div className="text-center p-8 text-muted-foreground">Cargando ofertas...</div>
      ) : ofertas.length === 0 ? (
        <div className="text-center p-12 bg-card border border-border rounded-xl">
          <Tag size={40} className="mx-auto mb-3 opacity-20 text-muted-foreground" />
          <p className="text-muted-foreground font-medium">No hay promociones registradas en este momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ofertas.map((oferta) => {
            const estado = determinarEstado(oferta.fechaInicio, oferta.fechaFin);

            return (
              <Card key={oferta.idOferta} hover>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                        <Tag size={20} className="text-accent" />
                      </div>
                      <div>
                        <h4 className="text-card-foreground font-semibold line-clamp-1">
                          {oferta.titulo}
                        </h4>
                        <p className="text-sm text-accent font-bold">{oferta.descuento}% OFF</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 p-3 bg-muted/60 border border-border rounded-lg text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${estado.color}`}
                      >
                        {estado.texto}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar size={12} /> Inicio:
                      </div>
                      <span className="text-foreground font-medium">{oferta.fechaInicio}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar size={12} /> Fin:
                      </div>
                      <span className="text-foreground font-medium">{oferta.fechaFin}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => abrirModal(oferta)}
                    >
                      <Edit2 size={14} />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-2"
                      onClick={() => eliminar(oferta.idOferta)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Dialog con validaciones React Hook Form */}
      <Dialog.Root open={modalAbierto} onOpenChange={setModalAbierto}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <Dialog.Title className="mb-6 text-card-foreground text-xl font-bold">
              {ofertaEditando ? 'Editar Oferta' : 'Nueva Oferta'}
            </Dialog.Title>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              
              {/* Título */}
              <Input
                label="Título de la oferta *"
                placeholder="Descuento Fiestas Patrias"
                error={errors.titulo?.message}
                {...register('titulo', {
                  required: 'El título de la oferta no puede estar vacío',
                  maxLength: {
                    value: 150,
                    message: 'El título no debe superar los 150 caracteres',
                  },
                  validate: (v) => v.trim().length > 0 || 'El título no puede contener solo espacios',
                })}
              />

              {/* Descuento */}
              <Input
                label="Descuento (%) *"
                type="number"
                step="1"
                min={0}
                max={100}
                placeholder="15"
                error={errors.descuento?.message}
                {...register('descuento', {
                  required: 'El descuento es obligatorio',
                  valueAsNumber: true,
                  min: {
                    value: 0,
                    message: 'El descuento debe ser cero o positivo',
                  },
                  max: {
                    value: 100,
                    message: 'El descuento no puede superar el 100%',
                  },
                  validate: (v) =>
                    (!isNaN(v) && v >= 0 && v <= 100) || 'Ingresa un porcentaje de descuento válido (0 - 100)',
                })}
              />

              {/* Combobox de Producto Opcional */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="productoId"
                  className="text-sm font-medium text-foreground flex items-center gap-2"
                >
                  <Package size={14} className="text-muted-foreground" /> Aplica al Producto (Opcional)
                </label>
                <div className="relative">
                  <select
                    id="productoId"
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
                    {...register('productoId', { valueAsNumber: true })}
                  >
                    <option value={0}>Seleccione un producto (Opcional)</option>
                    {productosDisponibles.map((prod) => (
                      <option key={prod.idProducto} value={prod.idProducto}>
                        {prod.nombre} ({prod.marca})
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none opacity-60"
                  />
                </div>
                {productosDisponibles.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    No hay productos registrados para vincular directamente.
                  </p>
                )}
              </div>

              {/* Rango de Fechas con Validación Cruzada */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Fecha de inicio *"
                  type="date"
                  error={errors.fechaInicio?.message}
                  {...register('fechaInicio', {
                    required: 'La fecha de inicio es obligatoria',
                    deps: ['fechaFin'], // Reevalúa la fecha fin al cambiar la fecha de inicio
                  })}
                />

                <Input
                  label="Fecha de fin *"
                  type="date"
                  error={errors.fechaFin?.message}
                  {...register('fechaFin', {
                    required: 'La fecha de fin es obligatoria',
                    validate: (val) => {
                      if (!fechaInicioWatch || !val) return true;
                      return (
                        new Date(`${val}T00:00:00`) >= new Date(`${fechaInicioWatch}T00:00:00`) ||
                        'La fecha fin no puede ser anterior a la de inicio'
                      );
                    },
                  })}
                />
              </div>

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
                    : ofertaEditando
                    ? 'Actualizar Oferta'
                    : 'Guardar Oferta'}
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};