import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';
import { Input } from '../../components/ui/input';
import { API_URL } from '../../context/AuthContext';

interface Categoria {
  idCategoria: number;
  nombreCategoria: string;
  descripcion: string;
  productos?: any[]; // Arreglo de productos devueltos por el backend
}

interface CategoriaForm {
  nombreCategoria: string;
  descripcion: string;
}

const categoriaInicial: CategoriaForm = {
  nombreCategoria: '',
  descripcion: '',
};

export const Categorias = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);
  const [formData, setFormData] = useState<CategoriaForm>(categoriaInicial);

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/categorias`, {
        credentials: 'include',
      });

      // Manejo de sesión expirada
      if (res.status === 401) {
        toast.error('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
        window.location.href = '/iniciar-sesion';
        return;
      }

      if (!res.ok) throw new Error('No se pudo cargar las categorías');
      
      const data = await res.json();
      setCategorias(data);
    } catch (error) {
      toast.error('Error al cargar categorías');
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
      toast.success('Categoría eliminada');
    } catch (error) {
      toast.error('Error al eliminar categoría');
      console.error(error);
    }
  };

  const abrirModal = (categoria?: Categoria) => {
    if (categoria) {
      setCategoriaEditando(categoria);
      setFormData({
        nombreCategoria: categoria.nombreCategoria,
        descripcion: categoria.descripcion,
      });
    } else {
      setCategoriaEditando(null);
      setFormData(categoriaInicial);
    }
    setModalAbierto(true);
  };

  const guardar = async () => {
    // Validaciones preventivas
    if (!formData.nombreCategoria.trim()) {
      toast.error('El nombre de la categoría no puede estar vacío');
      return;
    }

    if (!formData.descripcion.trim()) {
      toast.error('La descripción no puede estar vacía');
      return;
    }

    const payload = {
      nombreCategoria: formData.nombreCategoria.trim(),
      descripcion: formData.descripcion.trim(),
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

      if (!res.ok) throw new Error('Error al guardar la categoría');

      await cargarCategorias();
      toast.success(categoriaEditando ? 'Categoría actualizada' : 'Categoría creada');
      setModalAbierto(false);
      setCategoriaEditando(null);
      setFormData(categoriaInicial);
    } catch (error) {
      toast.error('Error al guardar categoría');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-2 text-foreground">Categorías</h2>
          <p className="text-muted-foreground">Organiza tus productos por categorías</p>
        </div>
        <Button variant="accent" onClick={() => abrirModal()} className="gap-2">
          <Plus size={18} />
          Nueva Categoría
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Cargando categorías...</div>
        ) : (
          <table className="w-full min-w-[640px]">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4 text-foreground">Categoría</th>
                <th className="text-left p-4 text-foreground">Descripción</th>
                <th className="text-left p-4 text-foreground">Productos</th>
                <th className="text-right p-4 text-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((categoria) => (
                <tr key={categoria.idCategoria} className="border-t border-border hover:bg-muted/50 transition-colors">
                  <td className="p-4 font-medium text-foreground">{categoria.nombreCategoria}</td>
                  <td className="p-4 text-muted-foreground">{categoria.descripcion}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-xs font-medium">
                      {/* Aquí mostramos la cantidad real de productos si existen */}
                      {categoria.productos ? categoria.productos.length : 0} productos
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => abrirModal(categoria)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => eliminar(categoria.idCategoria)}
                        className="p-2 hover:bg-destructive/20 rounded-lg transition-colors text-destructive"
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

      <Dialog.Root open={modalAbierto} onOpenChange={setModalAbierto}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl">
            <Dialog.Title className="mb-6 text-card-foreground">
              {categoriaEditando ? 'Editar Categoría' : 'Nueva Categoría'}
            </Dialog.Title>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-foreground">Nombre de la categoría</label>
                <Input
                  value={formData.nombreCategoria}
                  onChange={(e) => setFormData({ ...formData, nombreCategoria: e.target.value })}
                  placeholder="Ej: Lubricantes"
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-foreground">Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Descripción de la categoría..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-input-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
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