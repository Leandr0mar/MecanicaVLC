import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Package, Calendar, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { formatCurrency } from '../../utils/currency';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { API_URL } from '../../context/AuthContext';

export const MisPedidos = () => {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarMisPedidos();
  }, []);

  const cargarMisPedidos = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/ordenes/mis-pedidos`, { credentials: 'include' });
      
      if (res.status === 401) return (window.location.href = '/iniciar-sesion');
      if (!res.ok) throw new Error('Error al cargar pedidos');

      const data = await res.json();
      // Ordenamos para ver las compras más recientes primero
      const ordenados = data.sort((a: any, b: any) => b.idReserva - a.idReserva);
      setPedidos(ordenados);
    } catch (error) {
      toast.error('No se pudo cargar tu historial de pedidos');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoUI = (estado: string) => {
    switch (estado?.toUpperCase()) {
      case 'RECOGIDO': 
        return { label: 'Entregado', color: 'bg-green-500/20 text-green-600 dark:text-green-400', Icon: CheckCircle };
      case 'CANCELADO': 
        return { label: 'Cancelado', color: 'bg-red-500/20 text-red-600 dark:text-red-400', Icon: XCircle };
      default: 
        return { label: 'Pendiente', color: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400', Icon: Clock };
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-foreground">Mis Pedidos</h2>
        <p className="text-muted-foreground">Historial de tus compras de repuestos y productos</p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Cargando tu historial de compras...</div>
      ) : pedidos.length === 0 ? (
        <div className="p-12 text-center bg-card rounded-xl border border-border text-muted-foreground">
          <Package size={48} className="mx-auto mb-4 opacity-20" />
          Aún no has realizado ninguna compra de productos.
        </div>
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido, index) => {
            const ui = getEstadoUI(pedido.estadoRecojo);
            const StatusIcon = ui.Icon;

            return (
              <motion.div
                key={pedido.idReserva}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card hover className={`border-l-4 ${
                  pedido.estadoRecojo === 'RECOGIDO' ? 'border-l-green-500' : 
                  pedido.estadoRecojo === 'CANCELADO' ? 'border-l-red-500' : 'border-l-yellow-500'
                }`}>
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                          <Package size={24} className="text-accent" />
                        </div>
                        <div>
                          <h4 className="text-card-foreground font-bold">Pedido #{pedido.idReserva}</h4>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Calendar size={14} className="text-accent" />
                            {new Date(pedido.fechaReserva + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="sm:text-right flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
                        <p className="font-black text-accent text-lg mb-1">{formatCurrency(pedido.montoTotal)}</p>
                        <span className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full font-bold ${ui.color}`}>
                          <StatusIcon size={14} />
                          {ui.label}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-border pt-4 bg-muted/30 -mx-5 px-5 pb-2">
                      <h5 className="mb-3 text-sm font-bold text-foreground">Detalle de Productos:</h5>
                      <div className="space-y-2">
                        {pedido.items?.map((item: any) => (
                          <div key={item.idItemComprado} className="flex justify-between items-center text-sm p-2 bg-background border border-border/50 rounded-lg">
                            <span className="text-foreground font-medium flex items-center gap-2">
                              <span className="bg-accent/10 text-accent px-1.5 py-0.5 rounded font-bold text-xs">x{item.cantidad}</span>
                              {item.producto?.nombre}
                            </span>
                            <span className="text-muted-foreground font-mono">
                              {formatCurrency(item.precioUnitarioHistorial * item.cantidad)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>


                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};