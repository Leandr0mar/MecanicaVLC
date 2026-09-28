import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/ui/button';
import { Plus, Edit2, Trash2, Tag, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';
import { Input } from '../../components/ui/input';
import { API_URL } from '../../context/AuthContext';

interface Categoria {
  idCategoria: number;
  nombreCategoria: string;
  descripcion: string;
  productos?: any[];
}

interface CategoriaFormData {
  nombreCategoria: string;
  descripcion: string;
}

export const Categorias = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);

  // React Hook Form con estrategia profesional onBlur + onChange
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoriaFormData>({
    mode: 'onBlur',             // No interrumpe mientras el usuario escribe; valida al desenfocar
    reValidateMode: 'onChange', // Limpia el error al instante cuando el valor es corregido
    defaultValues: {
      nombreCategoria: '',
      descripcion: '',
    },
  });

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/categorias`, {
        credentials: 'include',
      });

      if (res.status === 401) {
        toast.error('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
        window.location.href = '/iniciar-sesion';
        return;
      }

      if (!res.ok) throw new Error('No se pudo cargar las categorías');

      const data = await res.json();
      setCategorias(data);
    } catch (error) {
      toast.error('Error al cargar las categorías');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const eliminar = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/categorias/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.status === 401) {
        toast.error('Sesión expirada');
        window.location.href = '/iniciar-sesion';
        return;
      }

      if (!res.ok) throw new Error('Error al eliminar');

      await cargarCategorias();
      toast.success('Categoría eliminada correctamente');
    } catch (error) {
      toast.error('No se pudo eliminar. Verifique si tiene productos asociados.');
      console.error(error);
    }
  };

  const abrirModal = (categoria?: Categoria) => {
    setCategoriaEditando(categoria ?? null);

    // Resetea y carga datos limpios en react-hook-form
    reset({
      nombreCategoria: categoria?.nombreCategoria ?? '',
      descripcion: categoria?.descripcion ?? '',
    });

    setModalAbierto(true);
  };

  const onSubmit = async (data: CategoriaFormData) => {
    setGuardando(true);
    const payload = {
      nombreCategoria: data.nombreCategoria.trim(),
      descripcion: data.descripcion.trim(),
    };

    try {
      const url = categoriaEditando
        ? `${API_URL}/api/categorias/${categoriaEditando.idCategoria}`
        : `${API_URL}/api/categorias`;

      const method = categoriaEditando ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        toast.error('Sesión expirada');
        window.location.href = '/iniciar-sesion';
        return;
      }

      if (!res.ok) {
        const errorDetail = await res.json().catch(() => null);
        throw new Error(errorDetail?.error || 'Error al guardar la categoría');
      }

      await cargarCategorias();
      toast.success(categoriaEditando ? 'Categoría actualizada correctamente' : 'Categoría creada correctamente');
      setModalAbierto(false);
      setCategoriaEditando(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar categoría');
      console.error(error);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-2 text-foreground font-bold text-2xl">Categorías</h2>
          <p className="text-muted-foreground text-sm">Organiza los repuestos e insumos por familias de productos</p>
        </div>
        <Button variant="accent" onClick={() => abrirModal()} className="gap-2">
          <Plus size={18} />
          Nueva Categoría
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Cargando categorías...</div>
        ) : categorias.length === 0 ? (
          <div className="text-center p-12 bg-card">
            <Tag size={40} className="mx-auto mb-3 opacity-20 text-muted-foreground" />
            <p className="text-muted-foreground font-medium">No hay categorías registradas en el catálogo.</p>
          </div>
        ) : (
          <table className="w-full min-w-[640px]">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4 text-foreground">Categoría</th>
                <th className="text-left p-4 text-foreground">Descripción</th>
                <th className="text-left p-4 text-foreground">Productos Vinculados</th>
                <th className="text-right p-4 text-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((categoria) => (
                <tr
                  key={categoria.idCategoria}
                  className="border-t border-border hover:bg-muted/50 transition-colors"
                >
                  <td className="p-4 font-semibold text-foreground">
                    {categoria.nombreCategoria}
                  </td>
                  <td className="p-4 text-muted-foreground text-sm max-w-md">
                    {categoria.descripcion}
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-accent/15 text-accent rounded-full text-xs font-medium">
                      {categoria.productos ? categoria.productos.length : 0} productos
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => abrirModal(categoria)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
                        title="Editar categoría"
                        aria-label={`Editar ${categoria.nombreCategoria}`}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => eliminar(categoria.idCategoria)}
                        className="p-2 hover:bg-destructive/20 rounded-lg transition-colors text-destructive"
                        title="Eliminar categoría"
                        aria-label={`Eliminar ${categoria.nombreCategoria}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Dialog con validaciones integradas */}
      <Dialog.Root open={modalAbierto} onOpenChange={setModalAbierto}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl">
            <Dialog.Title className="mb-6 text-card-foreground text-xl font-bold">
              {categoriaEditando ? 'Editar Categoría' : 'Nueva Categoría'}
            </Dialog.Title>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              
              {/* Nombre de la categoría */}
              <Input
                label="Nombre de la categoría *"
                placeholder="Ej: Lubricantes y Fluidos"
                error={errors.nombreCategoria?.message}
                {...register('nombreCategoria', {
                  required: 'El nombre de la categoría no puede estar vacío',
                  maxLength: {
                    value: 100,
                    message: 'El nombre no debe superar los 100 caracteres',
                  },
                  validate: (v) =>
                    v.trim().length > 0 || 'El nombre no puede consistir únicamente de espacios en blanco',
                })}
              />

              {/* Descripción */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="descripcion" className="text-sm font-medium text-foreground">
                  Descripción *
                </label>
                <textarea
                  id="descripcion"
                  rows={3}
                  placeholder="Detalla los componentes o repuestos clasificados en esta categoría..."
                  className={`w-full px-4 py-2.5 bg-input-background border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-colors ${
                    errors.descripcion ? 'border-destructive focus:ring-destructive' : 'border-input'
                  }`}
                  {...register('descripcion', {
                    required: 'La descripción no puede estar vacía',
                    maxLength: {
                      value: 255,
                      message: 'La descripción no debe superar los 255 caracteres',
                    },
                    validate: (v) =>
                      v.trim().length > 0 || 'La descripción no puede consistir únicamente de espacios en blanco',
                  })}
                />
                {errors.descripcion && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-0.5">
                    <AlertCircle size={12} />
                    {errors.descripcion.message}
                  </p>
                )}
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
                    ? 'Guardando...'
                    : categoriaEditando
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