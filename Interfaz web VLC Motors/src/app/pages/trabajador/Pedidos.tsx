import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Package, User } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '../../utils/currency';
import { motion } from 'motion/react';

const pedidosData = [
  {
    id: 1,
    cliente: 'Juan Pérez',
    productos: ['Aceite Motor 20W-50 (x2)', 'Filtro de Aceite (x1)'],
    total: 62,
    estado: 'pendiente',
    fecha: '2026-05-06',
  },
  {
    id: 2,
    cliente: 'Ana Torres',
    productos: ['Batería 12V (x1)'],
    total: 80,
    estado: 'pendiente',
    fecha: '2026-05-05',
  },
  {
    id: 3,
    cliente: 'Luis Ramírez',
    productos: ['Pastillas de Freno (x2)', 'Cadena de Transmisión (x1)'],
    total: 115,
    estado: 'entregado',
    fecha: '2026-05-04',
  },
];

export const Pedidos = () => {
  const [pedidos, setPedidos] = useState(pedidosData);

  const actualizarEstado = (id: number, nuevoEstado: string) => {
    setPedidos(pedidos.map((pedido) =>
      pedido.id === id ? { ...pedido, estado: nuevoEstado } : pedido
    ));
    toast.success(`Pedido #${id} marcado como ${nuevoEstado}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-foreground">Pedidos</h2>
        <p className="text-muted-foreground">Gestiona los pedidos de productos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {pedidos.map((pedido, index) => (
          <motion.div
            key={pedido.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
          <Card hover>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Package size={24} className="text-accent" />
                  </div>
                  <div>
                    <h4 className="text-card-foreground">Pedido #{pedido.id}</h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <User size={14} />
                      {pedido.cliente}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  pedido.estado === 'entregado'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {pedido.estado === 'entregado' ? 'Entregado' : 'Pendiente'}
                </span>
              </div>

              <div className="mb-4 p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Productos:</p>
                <ul className="space-y-1">
                  {pedido.productos.map((producto, index) => (
                    <li key={index} className="text-sm text-foreground">• {producto}</li>
                  ))}
                </ul>
                <div className="mt-3 pt-3 border-t border-border flex justify-between">
                  <span className="text-sm text-muted-foreground">Total:</span>
                  <span className="font-semibold text-accent">{formatCurrency(pedido.total)}</span>
                </div>
              </div>

              {pedido.estado === 'pendiente' && (
                <Button
                  variant="accent"
                  size="sm"
                  className="w-full"
                  onClick={() => actualizarEstado(pedido.id, 'entregado')}
                >
                  Marcar como Entregado
                </Button>
              )}
            </CardContent>
          </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
