import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';
import { Input } from '../../components/ui/input';
import { formatCurrency } from '../../utils/currency';
import { motion } from 'motion/react';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  categoria: string;
}

const productosIniciales: Producto[] = [
  { id: 1, nombre: 'Aceite Motor 20W-50', precio: 25, stock: 15, categoria: 'Lubricantes' },
  { id: 2, nombre: 'Filtro de Aceite', precio: 12, stock: 20, categoria: 'Filtros' },
  { id: 3, nombre: 'Bujías NGK', precio: 8, stock: 30, categoria: 'Electricidad' },
  { id: 4, nombre: 'Pastillas de Freno', precio: 35, stock: 10, categoria: 'Frenos' },
  { id: 5, nombre: 'Cadena de Transmisión', precio: 45, stock: 8, categoria: 'Transmisión' },
  { id: 6, nombre: 'Batería 12V', precio: 80, stock: 5, categoria: 'Electricidad' },
];

export const Productos = () => {
  const [productos, setProductos] = useState(productosIniciales);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null);

  const eliminar = (id: number) => {
    setProductos(productos.filter((p) => p.id !== id));
    toast.success('Producto eliminado');
  };

  const abrirModal = (producto?: Producto) => {
    setProductoEditando(producto || null);
    setModalAbierto(true);
  };

  const guardar = () => {
    toast.success(productoEditando ? 'Producto actualizado' : 'Producto creado');
    setModalAbierto(false);
    setProductoEditando(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-2 text-foreground">Productos</h2>
          <p className="text-muted-foreground">Administra el inventario de productos</p>
        </div>
        <Button variant="accent" onClick={() => abrirModal()} className="gap-2">
          <Plus size={18} />
          Nuevo Producto
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-4 text-foreground">Producto</th>
              <th className="text-left p-4 text-foreground">Categoría</th>
              <th className="text-left p-4 text-foreground">Precio</th>
              <th className="text-left p-4 text-foreground">Stock</th>
              <th className="text-right p-4 text-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr key={producto.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                <td className="p-4 font-medium text-foreground">{producto.nombre}</td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs">
                    {producto.categoria}
                  </span>
                </td>
                <td className="p-4 text-accent font-semibold">{formatCurrency(producto.precio)}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    producto.stock > 10 ? 'bg-green-500/20 text-green-400' :
                    producto.stock > 5 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {producto.stock} unidades
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => abrirModal(producto)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => eliminar(producto.id)}
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
      </div>

      <Dialog.Root open={modalAbierto} onOpenChange={setModalAbierto}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl">
            <Dialog.Title className="mb-6 text-card-foreground">
              {productoEditando ? 'Editar Producto' : 'Nuevo Producto'}
            </Dialog.Title>

            <div className="space-y-4">
              <Input label="Nombre del producto" placeholder="Aceite Motor 20W-50" defaultValue={productoEditando?.nombre} />
              <Input label="Categoría" placeholder="Lubricantes" defaultValue={productoEditando?.categoria} />
              <Input label="Precio" type="number" placeholder="25" defaultValue={productoEditando?.precio} />
              <Input label="Stock" type="number" placeholder="15" defaultValue={productoEditando?.stock} />
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
