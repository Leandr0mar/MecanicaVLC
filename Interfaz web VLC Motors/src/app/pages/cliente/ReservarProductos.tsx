import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/button';
import { ShoppingCart, Minus, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '../../utils/currency';
import { motion } from 'motion/react';

const productos = [
  { id: 1, nombre: 'Aceite Motor 20W-50', precio: 25, stock: 15, imagen: '🛢️' },
  { id: 2, nombre: 'Filtro de Aceite', precio: 12, stock: 20, imagen: '🔧' },
  { id: 3, nombre: 'Bujías NGK', precio: 8, stock: 30, imagen: '⚡' },
  { id: 4, nombre: 'Pastillas de Freno', precio: 35, stock: 10, imagen: '🛑' },
  { id: 5, nombre: 'Cadena de Transmisión', precio: 45, stock: 8, imagen: '⛓️' },
  { id: 6, nombre: 'Batería 12V', precio: 80, stock: 5, imagen: '🔋' },
];

interface CartItem {
  id: number;
  cantidad: number;
}

export const ReservarProductos = () => {
  const [carrito, setCarrito] = useState<CartItem[]>([]);

  const agregarAlCarrito = (id: number) => {
    const existing = carrito.find((item) => item.id === id);
    if (existing) {
      setCarrito(carrito.map((item) =>
        item.id === id ? { ...item, cantidad: item.cantidad + 1 } : item
      ));
    } else {
      setCarrito([...carrito, { id, cantidad: 1 }]);
    }
    toast.success('Producto agregado al carrito');
  };

  const actualizarCantidad = (id: number, cambio: number) => {
    setCarrito(
      carrito
        .map((item) =>
          item.id === id ? { ...item, cantidad: item.cantidad + cambio } : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const eliminarDelCarrito = (id: number) => {
    setCarrito(carrito.filter((item) => item.id !== id));
    toast.info('Producto eliminado del carrito');
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => {
      const producto = productos.find((p) => p.id === item.id);
      return total + (producto?.precio || 0) * item.cantidad;
    }, 0);
  };

  const finalizarCompra = () => {
    if (carrito.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }
    toast.success('Pedido realizado exitosamente');
    setCarrito([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-foreground">Reservar Productos</h2>
        <p className="text-muted-foreground">Selecciona los productos que necesitas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {productos.map((producto, index) => (
              <motion.div
                key={producto.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
              <Card hover>
                <CardContent className="p-4">
                  <div className="text-center mb-4">
                    <div className="text-5xl mb-2">{producto.imagen}</div>
                    <h4 className="mb-1 text-card-foreground">{producto.nombre}</h4>
                    <p className="text-sm text-muted-foreground">Stock: {producto.stock}</p>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-accent">{formatCurrency(producto.precio)}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      producto.stock > 10 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {producto.stock > 10 ? 'Disponible' : 'Poco stock'}
                    </span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => agregarAlCarrito(producto.id)}
                    disabled={producto.stock === 0}
                  >
                    Agregar
                  </Button>
                </CardContent>
              </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart size={20} className="text-accent" />
                Carrito ({carrito.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {carrito.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart size={48} className="mx-auto mb-2 opacity-30" />
                  <p>Tu carrito está vacío</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {carrito.map((item) => {
                      const producto = productos.find((p) => p.id === item.id);
                      if (!producto) return null;

                      return (
                        <div key={item.id} className="p-3 bg-muted rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="font-medium text-sm text-foreground">{producto.nombre}</p>
                              <p className="text-accent text-sm">{formatCurrency(producto.precio)}</p>
                            </div>
                            <button
                              onClick={() => eliminarDelCarrito(item.id)}
                              className="text-destructive hover:text-destructive/80 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => actualizarCantidad(item.id, -1)}
                              className="w-7 h-7 rounded bg-input-background hover:bg-accent/20 transition-colors flex items-center justify-center"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="flex-1 text-center font-medium">{item.cantidad}</span>
                            <button
                              onClick={() => actualizarCantidad(item.id, 1)}
                              className="w-7 h-7 rounded bg-input-background hover:bg-accent/20 transition-colors flex items-center justify-center"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex justify-between mb-4">
                      <span className="font-medium text-foreground">Total:</span>
                      <span className="font-bold text-accent">{formatCurrency(calcularTotal())}</span>
                    </div>
                    <Button variant="accent" className="w-full" onClick={finalizarCompra}>
                      Finalizar Compra
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
