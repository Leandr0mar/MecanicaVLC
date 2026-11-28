import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Package, Calendar, FileText, CheckCircle, Clock, XCircle, ReceiptText, Download } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { formatCurrency } from '../../utils/currency';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { API_URL } from '../../context/AuthContext';
import * as Dialog from '@radix-ui/react-dialog';

interface ItemPedido {
  idItemComprado: number;
  cantidad: number;
  precioUnitarioHistorial: number;
  producto?: { nombre?: string };
}

interface Pedido {
  idReserva: number;
  fechaReserva: string;
  fechaPago?: string;
  montoTotal: number;
  montoPagado?: number;
  pagoRegistrado?: boolean;
  metodoPago?: string;
  estadoRecojo: string;
  cliente?: { nombre?: string; apellido?: string; tipoDocumento?: string; numeroDocumento?: string; dni?: string; telefono?: string; email?: string; direccion?: string };
  items?: ItemPedido[];
}

export const MisPedidos = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [boletaPedido, setBoletaPedido] = useState<Pedido | null>(null);

  const importesBoleta = (pedido: Pedido) => {
    const total = Math.round(Number(pedido.montoPagado ?? pedido.montoTotal) * 100) / 100;
    const base = Math.round((total / 1.18) * 100) / 100;
    return { total, base, igv: Math.round((total - base) * 100) / 100 };
  };

  const escaparHTML = (valor: string) => valor.replace(/[&<>"']/g, (caracter) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[caracter] as string);

  const exportarBoletaPDF = (pedido: Pedido) => {
    const ventana = window.open('', '_blank');
    if (!ventana) return toast.error('Permite las ventanas emergentes para exportar la boleta');
    const { total, base, igv } = importesBoleta(pedido);
    const cliente = pedido.cliente;
    const nombre = `${cliente?.nombre ?? ''} ${cliente?.apellido ?? ''}`.trim() || 'No disponible';
    const documento = cliente?.numeroDocumento || cliente?.dni || 'No disponible';
    const fecha = pedido.fechaPago ? new Date(pedido.fechaPago).toLocaleString('es-PE') : '';
    const fila = (titulo: string, valor: string) => `<tr><td>${escaparHTML(titulo)}</td><td>${escaparHTML(valor || 'No disponible')}</td></tr>`;
    const items = (pedido.items ?? []).map(item => `<tr><td>${escaparHTML(item.producto?.nombre ?? 'Producto')} × ${item.cantidad}</td><td>${formatCurrency(item.precioUnitarioHistorial * item.cantidad)}</td></tr>`).join('');
    ventana.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Boleta ${pedido.idReserva}</title><style>*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#172033;margin:0;padding:36px;background:#f1f5f9}.receipt{max-width:760px;margin:auto;background:#fff;padding:42px;border:1px solid #dbe2ea;border-radius:12px}header{display:flex;justify-content:space-between;gap:24px;border-bottom:2px solid #c59d36;padding-bottom:20px;margin-bottom:24px}h1{font-size:22px;margin:0 0 6px}h2{font-size:14px;text-transform:uppercase;letter-spacing:.08em;color:#475569;margin:25px 0 8px}p{margin:5px 0;font-size:13px;color:#475569}table{width:100%;border-collapse:collapse;font-size:13px}td{padding:9px 4px;border-bottom:1px solid #e5e7eb}td:first-child{color:#64748b}.number{text-align:right;font-weight:bold;color:#9a7620}.number strong{display:block;font-size:20px;margin-top:6px}.amounts{width:320px;margin:20px 0 0 auto}.amounts tr:last-child{font-size:17px;font-weight:bold;color:#172033}@media print{body{background:white;padding:0}.receipt{border:0;border-radius:0;max-width:none;padding:20px}}</style></head><body><main class="receipt"><header><div><h1>Boleta de venta electrónica</h1><p>VLC Motors · RUC: 20123456789</p><p>Fecha de emisión: ${escaparHTML(fecha)}</p></div><div class="number">N.º BOLETA<strong>B002-${String(pedido.idReserva).padStart(8, '0')}</strong></div></header><h2>Cliente</h2><table>${fila('Nombre', nombre)}${fila('Documento', `${cliente?.tipoDocumento || 'Documento'}: ${documento}`)}${fila('Dirección', cliente?.direccion ?? '')}</table><h2>Productos</h2><table><tr><td>Descripción</td><td>Importe</td></tr>${items}</table><h2>Pago</h2><table>${fila('Fecha de pago', fecha)}${fila('Medio de pago', pedido.metodoPago?.replace('_', ' ').toLowerCase() ?? '')}</table><table class="amounts"><tr><td>Valor de venta</td><td>${formatCurrency(base)}</td></tr><tr><td>IGV (18%, incluido)</td><td>${formatCurrency(igv)}</td></tr><tr><td>Total pagado</td><td>${formatCurrency(total)}</td></tr></table></main><script>window.onload=()=>{window.focus();window.print()}</script></body></html>`);
    ventana.document.close();
  };

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
      const prioridad = (estado: string) => ({ PENDIENTE: 0, RECOGIDO: 1, CANCELADO: 2 }[estado?.toUpperCase()] ?? 3);
      const ordenados = [...data].sort((a: Pedido, b: Pedido) =>
        prioridad(a.estadoRecojo) - prioridad(b.estadoRecojo) || b.idReserva - a.idReserva
      );
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
    <>
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
                      <div className="flex w-full flex-wrap flex-row items-center justify-between gap-x-2 gap-y-1 sm:w-auto sm:flex-col sm:items-end sm:text-right">
                        <p className="font-black text-accent text-lg mb-1">{formatCurrency(pedido.montoTotal)}</p>
                        <span className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full font-bold ${ui.color}`}>
                          <StatusIcon size={14} />
                          {pedido.pagoRegistrado ? 'Entregado · pagado' : ui.label}
                        </span>
                        {pedido.estadoRecojo === 'PENDIENTE' && <span className="mt-1 text-xs text-amber-700 dark:text-amber-400">Pago presencial pendiente</span>}
                        {pedido.estadoRecojo === 'RECOGIDO' && pedido.pagoRegistrado && (
                          <Button variant="outline" size="sm" className="mt-2 gap-1.5" onClick={() => setBoletaPedido(pedido)}><ReceiptText size={15} /> Ver boleta</Button>
                        )}
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
    <Dialog.Root open={Boolean(boletaPedido)} onOpenChange={(open) => !open && setBoletaPedido(null)}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 duration-200 fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 duration-200 fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-2xl sm:p-7">
          {boletaPedido && (() => {
            const { total, base, igv } = importesBoleta(boletaPedido);
            const cliente = boletaPedido.cliente;
            const numero = `B002-${String(boletaPedido.idReserva).padStart(8, '0')}`;
            return <>
              <div className="mb-5 flex items-start justify-between gap-4 border-b border-border pb-4">
                <div>
                  <Dialog.Title className="text-xl font-bold text-card-foreground">Boleta de venta electrónica</Dialog.Title>
                  <Dialog.Description className="mt-1 text-sm text-muted-foreground">VLC Motors · RUC: 20123456789 · Boleta N.º {numero}</Dialog.Description>
                  <p className="mt-1 text-xs text-muted-foreground">Av. Ejemplo 123, Lima, Perú</p>
                </div>
                <ReceiptText className="text-accent" size={28} />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <section className="space-y-1 text-sm"><h3 className="mb-2 font-semibold text-foreground">Cliente</h3><p className="text-muted-foreground">{cliente?.nombre} {cliente?.apellido}</p><p className="text-muted-foreground">{cliente?.tipoDocumento || 'Documento'}: {cliente?.numeroDocumento || cliente?.dni || 'No disponible'}</p><p className="text-muted-foreground">Teléfono: {cliente?.telefono || 'No disponible'}</p><p className="break-all text-muted-foreground">Correo: {cliente?.email || 'No disponible'}</p><p className="text-muted-foreground">Dirección: {cliente?.direccion || 'No disponible'}</p></section>
                <section className="space-y-1 text-sm"><h3 className="mb-2 font-semibold text-foreground">Pedido</h3><p className="text-muted-foreground">Orden: #{boletaPedido.idReserva}</p><p className="text-muted-foreground">Fecha de compra: {new Date(`${boletaPedido.fechaReserva}T00:00:00`).toLocaleDateString('es-PE')}</p><p className="text-muted-foreground">Fecha de pago: {boletaPedido.fechaPago ? new Date(boletaPedido.fechaPago).toLocaleString('es-PE') : 'No disponible'}</p></section>
              </div>
              <section className="mt-5 rounded-lg border border-border p-4">
                <h3 className="mb-3 font-semibold text-foreground">Detalle de productos</h3>
                <div className="space-y-2">{boletaPedido.items?.map(item => <div key={item.idItemComprado} className="flex justify-between gap-3 text-sm"><span className="text-muted-foreground">{item.producto?.nombre} × {item.cantidad}</span><span className="font-medium">{formatCurrency(item.precioUnitarioHistorial * item.cantidad)}</span></div>)}</div>
              </section>
              <section className="mt-4 rounded-lg border border-border p-4">
                <h3 className="mb-3 font-semibold text-foreground">Pago presencial</h3>
                <div className="space-y-2 text-sm"><div className="flex justify-between gap-4"><span className="text-muted-foreground">Método</span><span className="font-medium capitalize">{boletaPedido.metodoPago?.replace('_', ' ').toLowerCase() || 'No disponible'}</span></div><div className="flex justify-between gap-4"><span className="text-muted-foreground">Valor de venta</span><span>{formatCurrency(base)}</span></div><div className="flex justify-between gap-4"><span className="text-muted-foreground">IGV (18%, incluido)</span><span>{formatCurrency(igv)}</span></div><div className="flex justify-between gap-4 border-t border-border pt-2 text-base font-bold"><span>Total pagado</span><span className="text-accent">{formatCurrency(total)}</span></div></div>
              </section>
              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button variant="ghost" onClick={() => setBoletaPedido(null)}>Cerrar</Button><Button variant="accent" onClick={() => exportarBoletaPDF(boletaPedido)}><Download size={16} /> Exportar PDF</Button></div>
            </>;
          })()}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
    </>
  );
};
