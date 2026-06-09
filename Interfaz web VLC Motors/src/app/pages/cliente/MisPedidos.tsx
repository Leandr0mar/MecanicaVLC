import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Package, Calendar, FileText } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { formatCurrency } from '../../utils/currency';
import { motion } from 'motion/react';

const pedidos = [
  {
    id: 1,
    fecha: '2026-05-02',
    total: 92,
    estado: 'entregado',
    productos: [
      { nombre: 'Aceite Motor 20W-50', cantidad: 2, precio: 25 },
      { nombre: 'Filtro de Aceite', cantidad: 1, precio: 12 },
      { nombre: 'Bujías NGK', cantidad: 4, precio: 8 },
    ],
  },
  {
    id: 2,
    fecha: '2026-04-25',
    total: 160,
    estado: 'entregado',
    productos: [
      { nombre: 'Batería 12V', cantidad: 1, precio: 80 },
      { nombre: 'Pastillas de Freno', cantidad: 2, precio: 35 },
    ],
  },
  {
    id: 3,
    fecha: '2026-05-05',
    total: 45,
    estado: 'pendiente',
    productos: [
      { nombre: 'Cadena de Transmisión', cantidad: 1, precio: 45 },
    ],
  },
];

export const MisPedidos = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-foreground">Mis Pedidos</h2>
        <p className="text-muted-foreground">Historial de tus compras de productos</p>
      </div>

      <div className="space-y-4">
        {pedidos.map((pedido, index) => (
          <motion.div
            key={pedido.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
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
                      <Calendar size={14} />
                      {new Date(pedido.fecha).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-accent">{formatCurrency(pedido.total)}</p>
                  <span className={`text-xs px-3 py-1 rounded-full ${
                    pedido.estado === 'entregado'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {pedido.estado === 'entregado' ? 'Entregado' : 'Pendiente'}
                  </span>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h5 className="mb-3 text-sm font-medium text-foreground">Productos:</h5>
                <div className="space-y-2">
                  {pedido.productos.map((producto, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {producto.cantidad}x {producto.nombre}
                      </span>
                      <span className="text-foreground">{formatCurrency(producto.precio * producto.cantidad)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <Button variant="ghost" size="sm" className="w-full gap-2">
                  <FileText size={16} />
                  Ver Boleta
                </Button>
              </div>
            </CardContent>
          </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
