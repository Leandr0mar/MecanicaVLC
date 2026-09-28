import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/button';
import { Package, User, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '../../utils/currency';
import { motion } from 'motion/react';
import { API_URL } from '../../context/AuthContext';

export const Pedidos = () => {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/ordenes`, { credentials: 'include' });
      if (res.status === 401) return (window.location.href = '/iniciar-sesion');
      if (!res.ok) throw new Error('Error al cargar la información');
      
      const data = await res.json();
      // Ordenamos para que los pedidos más recientes aparezcan al inicio de la lista
      const ordenados = data.sort((a: any, b: any) => b.idReserva - a.idReserva);
      setPedidos(ordenados);
    } catch (error) {
      toast.error('Error al cargar el historial de pedidos');
    } finally {
      setLoading(false);
    }
  };

  const actualizarEstado = async (id: number, nuevoEstado: string) => {
    const accionTexto = nuevoEstado === 'RECOGIDO' ? 'marcar como entregado' : 'cancelar';
    if (!window.confirm(`¿Estás seguro de ${accionTexto} este pedido?`)) return;

    try {
      const res = await fetch(`${API_URL}/api/ordenes/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (res.status === 401) return (window.location.href = '/iniciar-sesion');
      if (!res.ok) throw new Error('Error al actualizar');

      toast.success(nuevoEstado === 'RECOGIDO' ? 'Pedido completado con éxito' : 'Pedido anulado y stock devuelto');
      await cargarPedidos(); // Recargar la tabla para ver los cambios
    } catch (error) {
      toast.error('No se pudo procesar la solicitud');
    }
  };

  // Función para determinar estilos según el estado
  const getEstadoUI = (estado: string) => {
    switch (estado?.toUpperCase()) {
      case 'RECOGIDO': 
        return { color: 'bg-green-500/20 text-green-600 dark:text-green-400', label: 'Compra Entregada', Icon: CheckCircle };
      case 'CANCELADO': 
        return { color: 'bg-red-500/20 text-red-600 dark:text-red-400', label: 'Orden Cancelada', Icon: XCircle };
      default: 
        return { color: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400', label: 'Pendiente de Recojo', Icon: Clock };
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-foreground">Pedidos Web</h2>
        <p className="text-muted-foreground">Gestiona las reservas y entregas de repuestos</p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Cargando lista de pedidos...</div>
      ) : pedidos.length === 0 ? (
        <div className="p-12 text-center bg-card rounded-xl border border-border text-muted-foreground">
          <Package size={48} className="mx-auto mb-4 opacity-20" />
          Aún no se han registrado órdenes de compra.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {pedidos.map((pedido, index) => {
            const ui = getEstadoUI(pedido.estadoRecojo);
            const StatusIcon = ui.Icon;

            return (
              <motion.div
                key={pedido.idReserva}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card hover className={`border-l-4 ${
                  pedido.estadoRecojo === 'RECOGIDO' ? 'border-l-green-500' : 
                  pedido.estadoRecojo === 'CANCELADO' ? 'border-l-red-500' : 'border-l-yellow-500'
                }`}>
                  <CardContent className="p-5 flex flex-col h-full">
                    {/* Encabezado de la Tarjeta */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                          <Package size={24} className="text-accent" />
                        </div>
                        <div>
                          <h4 className="text-card-foreground font-bold">Orden #{pedido.idReserva}</h4>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                            <User size={13} className="text-accent" />
                            {pedido.cliente?.nombre} {pedido.cliente?.apellido}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${ui.color}`}>
                        <StatusIcon size={14} />
                        {ui.label}
                      </span>
                    </div>

                    {/* Lista de Productos Comprados */}
                    <div className="mb-4 p-3 bg-muted rounded-lg border border-border flex-1">
                      <p className="text-xs font-medium text-muted-foreground mb-2 flex justify-between">
                        <span>Detalle de productos:</span>
                        <span>{new Date(pedido.fechaReserva + 'T00:00:00').toLocaleDateString('es-ES')}</span>
                      </p>
                      <ul className="space-y-1.5 mb-3 max-h-32 overflow-y-auto pr-1">
                        {pedido.items?.map((item: any) => (
                          <li key={item.idItemComprado} className="text-sm text-foreground flex justify-between items-center bg-background p-1.5 rounded border border-border/50">
                            <span className="truncate pr-2">
                              <span className="font-bold text-accent mr-2">x{item.cantidad}</span>
                              {item.producto?.nombre}
                            </span>
                            <span className="text-xs font-mono">{formatCurrency(item.precioUnitarioHistorial * item.cantidad)}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="pt-3 border-t border-border flex justify-between items-center">
                        <span className="text-sm text-muted-foreground font-medium">Total facturado:</span>
                        <span className="font-black text-lg text-accent">{formatCurrency(pedido.montoTotal)}</span>
                      </div>
                    </div>

                    {/* Botones de Acción Múltiple */}
                    {pedido.estadoRecojo === 'PENDIENTE' && (
                      <div className="flex gap-2 mt-auto">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1 bg-red-500/10 text-red-600 hover:bg-red-500/20 hover:text-red-700 dark:text-red-400 border border-red-500/20"
                          onClick={() => actualizarEstado(pedido.idReserva, 'CANCELADO')}
                        >
                          Cancelar Compra
                        </Button>
                        <Button
                          variant="accent"
                          size="sm"
                          className="flex-1 font-bold"
                          onClick={() => actualizarEstado(pedido.idReserva, 'RECOGIDO')}
                        >
                          Marcar Entregado
                        </Button>
                      </div>
                    )}
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