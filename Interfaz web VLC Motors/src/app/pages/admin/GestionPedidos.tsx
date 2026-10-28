import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/button';
import { Calendar, Edit2, Trash2, CheckCircle, XCircle, Filter, Download, Package, User, Clock, FileText } from 'lucide-react';
import { toast } from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';
import { formatCurrency } from '../../utils/currency';
import { API_URL } from '../../context/AuthContext';
import * as XLSX from 'xlsx';
import { AdminSearchInput } from '../../components/ui/AdminSearchInput';

interface ItemPedido {
  idItemComprado: number;
  cantidad: number;
  precioUnitarioHistorial: number;
  producto: { nombre: string };
}

interface Pedido {
  idReserva: number;
  fechaReserva: string;
  montoTotal: number;
  estadoRecojo: string;
  cliente: { nombre: string; apellido: string; telefono: string };
  items: ItemPedido[];
}

const TAMANO_PAGINA = 10;

export const GestionPedidos = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filtroEstado, setFiltroEstado] = useState<string | 'TODOS'>('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalPedidos, setTotalPedidos] = useState(0);
  const busquedaInicial = useRef(true);
  
  // Estados para el Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [pedidoEditando, setPedidoEditando] = useState<Pedido | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState<string>('');

  useEffect(() => { cargarDatos(); }, [pagina, filtroEstado]);

  useEffect(() => {
    if (busquedaInicial.current) { busquedaInicial.current = false; return; }
    const temporizador = window.setTimeout(() => {
      if (pagina !== 0) setPagina(0);
      else cargarDatos();
    }, busqueda ? 300 : 0);
    return () => window.clearTimeout(temporizador);
  }, [busqueda]);

  const cargarDatos = async () => {
    try {
      if (!pedidos.length) setLoading(true);
      const params = new URLSearchParams({ pagina: String(pagina), tamano: String(TAMANO_PAGINA), q: busqueda.trim() });
      if (filtroEstado !== 'TODOS') params.set('estado', filtroEstado);
      const res = await fetch(`${API_URL}/api/ordenes/pagina?${params}`, { credentials: 'include' });

      if (res.status === 401) return (window.location.href = '/iniciar-sesion');
      if (!res.ok) throw new Error('Error al cargar pedidos');
      
      const pageData = await res.json();
      if (pagina > 0 && pagina >= (pageData.totalPaginas ?? 0)) {
        setPagina(Math.max(0, (pageData.totalPaginas ?? 0) - 1));
        return;
      }
      const data = pageData.contenido ?? [];
      setTotalPaginas(pageData.totalPaginas ?? 0);
      setTotalPedidos(pageData.totalElementos ?? 0);
      const prioridad = (estado: string) => ({ PENDIENTE: 0, RECOGIDO: 1, CANCELADO: 2 }[estado?.toUpperCase()] ?? 3);
      const ordenadas = data.sort((a: Pedido, b: Pedido) =>
        prioridad(a.estadoRecojo) - prioridad(b.estadoRecojo) || b.idReserva - a.idReserva
      );
      setPedidos(ordenadas);
    } catch (error) {
      toast.error('Error al cargar la información de los pedidos');
    } finally {
      setLoading(false);
    }
  };

  const abrirModalEdicion = (pedido: Pedido) => {
    setPedidoEditando(pedido);
    setNuevoEstado(pedido.estadoRecojo);
    setModalAbierto(true);
  };

  const guardarCambios = async () => {
    if (!pedidoEditando) return;
    
    // Si el estado no cambió, simplemente cerramos el modal
    if (nuevoEstado === pedidoEditando.estadoRecojo) {
      setModalAbierto(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/ordenes/${pedidoEditando.idReserva}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (res.status === 401) return (window.location.href = '/iniciar-sesion');
      if (!res.ok) throw new Error('Error al actualizar el estado');

      toast.success(nuevoEstado === 'RECOGIDO' ? 'Pedido completado con éxito' : 'Estado del pedido actualizado');
      await cargarDatos(); 
      setModalAbierto(false);
    } catch (error) {
      toast.error('Ocurrió un error al guardar los cambios del pedido');
    }
  };

  const getEstadoUI = (estado: string) => {
    switch (estado?.toUpperCase()) {
      case 'PENDIENTE': return { icon: Clock, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400', label: 'Pendiente' };
      case 'RECOGIDO': return { icon: CheckCircle, color: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400', label: 'Entregado' };
      case 'CANCELADO': return { icon: XCircle, color: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400', label: 'Cancelado' };
      default: return { icon: AlertCircle, color: 'bg-muted text-muted-foreground', label: estado };
    }
  };

  const pedidosFiltrados = pedidos;

  // --- LÓGICA: EXPORTAR A EXCEL ---
  const exportarExcel = async () => {
    if (totalPedidos === 0) {
      return toast.error('No hay pedidos para exportar bajo el filtro actual');
    }

    const params = new URLSearchParams({ pagina: '0', tamano: '100', q: busqueda.trim() });
    if (filtroEstado !== 'TODOS') params.set('estado', filtroEstado);
    const inicial = await fetch(`${API_URL}/api/ordenes/pagina?${params}`, { credentials: 'include' });
    if (!inicial.ok) return toast.error('No se pudo preparar la exportación de pedidos');
    const primeraPagina = await inicial.json();
    const pedidosExportar: Pedido[] = [...(primeraPagina.contenido ?? [])];
    for (let numero = 1; numero < (primeraPagina.totalPaginas ?? 0); numero += 1) {
      params.set('pagina', String(numero));
      const siguiente = await fetch(`${API_URL}/api/ordenes/pagina?${params}`, { credentials: 'include' });
      if (!siguiente.ok) return toast.error('No se pudo completar la exportación de pedidos');
      pedidosExportar.push(...((await siguiente.json()).contenido ?? []));
    }

    const datosExcel = pedidosExportar.map((pedido) => {
      // Unimos todos los productos en una sola cadena de texto para el reporte
      const resumenProductos = pedido.items?.map(i => `[x${i.cantidad}] ${i.producto?.nombre}`).join(' | ') || 'Sin productos';

      return {
        'N° Orden': pedido.idReserva,
        'Fecha de Reserva': new Date(pedido.fechaReserva + 'T00:00:00').toLocaleDateString('es-ES'),
        'Estado': pedido.estadoRecojo.replace('_', ' '),
        'Cliente': `${pedido.cliente?.nombre} ${pedido.cliente?.apellido}`,
        'Teléfono': pedido.cliente?.telefono,
        'Monto Total (S/.)': pedido.montoTotal || 0,
        'Productos Entregados': resumenProductos
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(datosExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pedidos_Web');

    const wscols = [
      { wch: 12 }, // Orden
      { wch: 18 }, // Fecha
      { wch: 15 }, // Estado
      { wch: 35 }, // Cliente
      { wch: 15 }, // Teléfono
      { wch: 20 }, // Monto Total
      { wch: 70 }  // Productos
    ];
    worksheet['!cols'] = wscols;

    XLSX.writeFile(workbook, `Reporte_Pedidos_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Reporte de pedidos exportado correctamente');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="mb-2 text-foreground">Gestión de Pedidos Web</h2>
          <p className="text-muted-foreground">Administra las compras de repuestos y coordina las entregas</p>
        </div>
        
        <AdminSearchInput value={busqueda} onChange={setBusqueda} placeholder="Buscar por cliente, producto, orden o fecha..." className="xl:mx-6" />

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <Button variant="secondary" onClick={exportarExcel} className="gap-2 bg-green-600/10 text-green-600 hover:bg-green-600/20 hover:text-green-700 dark:text-green-400 border border-green-600/20 h-10">
            <Download size={16} />
            Exportar Excel
          </Button>

          <div className="flex bg-card border border-border p-1 rounded-lg overflow-x-auto">
            <Button variant={filtroEstado === 'TODOS' ? 'secondary' : 'ghost'} size="sm" onClick={() => { setPagina(0); setFiltroEstado('TODOS'); }} className="text-xs">Todos</Button>
            <Button variant={filtroEstado === 'PENDIENTE' ? 'secondary' : 'ghost'} size="sm" onClick={() => { setPagina(0); setFiltroEstado('PENDIENTE'); }} className="text-xs text-yellow-600 dark:text-yellow-400">Pendientes</Button>
            <Button variant={filtroEstado === 'RECOGIDO' ? 'secondary' : 'ghost'} size="sm" onClick={() => { setPagina(0); setFiltroEstado('RECOGIDO'); }} className="text-xs text-green-600 dark:text-green-400">Entregados</Button>
            <Button variant={filtroEstado === 'CANCELADO' ? 'secondary' : 'ghost'} size="sm" onClick={() => { setPagina(0); setFiltroEstado('CANCELADO'); }} className="text-xs text-red-600 dark:text-red-400">Cancelados</Button>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Cargando lista de pedidos...</div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="text-center p-12 bg-card">
            <Filter size={40} className="mx-auto mb-3 opacity-20" />
            <p className="text-muted-foreground">No se encontraron pedidos bajo este filtro.</p>
          </div>
        ) : (
          <table className="w-full min-w-[900px]">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4 text-foreground">N° Orden & Fecha</th>
                <th className="text-left p-4 text-foreground">Cliente</th>
                <th className="text-left p-4 text-foreground">Resumen de Compra</th>
                <th className="text-center p-4 text-foreground">Estado</th>
                <th className="text-right p-4 text-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map((pedido) => {
                const ui = getEstadoUI(pedido.estadoRecojo);
                const Icon = ui.icon;
                
                return (
                  <tr key={pedido.idReserva} className="border-t border-border hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-foreground flex items-center gap-2">
                        <Package size={14} className="text-accent" />
                        Orden #{pedido.idReserva}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1 font-medium">
                        <Calendar size={13} />
                        {new Date(pedido.fechaReserva + 'T00:00:00').toLocaleDateString('es-ES')}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-foreground">{pedido.cliente?.nombre} {pedido.cliente?.apellido}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Tel: {pedido.cliente?.telefono}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-foreground">
                        {pedido.items?.length || 0} {(pedido.items?.length === 1) ? 'producto' : 'productos'}
                      </div>
                      <div className="text-xs text-accent font-black mt-1 text-base">{formatCurrency(pedido.montoTotal || 0)}</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider ${ui.color}`}>
                        <Icon size={14} />
                        {ui.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => abrirModalEdicion(pedido)} className="p-2 hover:bg-muted rounded-lg text-foreground transition-colors" title="Gestionar y ver detalles">
                          <Edit2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>{totalPedidos === 0 ? 'Sin pedidos' : `Mostrando ${pagina * TAMANO_PAGINA + 1}–${Math.min((pagina + 1) * TAMANO_PAGINA, totalPedidos)} de ${totalPedidos} pedidos`}</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={pagina === 0 || loading} onClick={() => setPagina((actual) => Math.max(0, actual - 1))}>Anterior</Button>
          <span>Página {totalPaginas === 0 ? 0 : pagina + 1} de {totalPaginas}</span>
          <Button variant="outline" size="sm" disabled={pagina + 1 >= totalPaginas || loading} onClick={() => setPagina((actual) => actual + 1)}>Siguiente</Button>
        </div>
      </div>

      {/* MODAL PARA DETALLES Y CAMBIO DE ESTADO */}
      <Dialog.Root open={modalAbierto} onOpenChange={setModalAbierto}>
        <Dialog.Portal>
          <Dialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 duration-200 fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 duration-200 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <Dialog.Title className="mb-2 text-card-foreground text-lg font-bold flex items-center gap-2">
              <Package className="text-accent" size={20}/>
              Gestión de Pedido #{pedidoEditando?.idReserva}
            </Dialog.Title>
            <p className="text-sm text-muted-foreground mb-6">
              Verifica los productos a entregar y actualiza el estado de la compra.
            </p>

            {pedidoEditando && (
              <div className="space-y-5">
                {/* Info Cliente */}
                <div className="p-4 bg-muted/50 rounded-lg text-sm border border-border">
                  <p className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Cliente:</span> 
                    <span className="font-bold text-foreground flex items-center gap-1.5"><User size={14}/>{pedidoEditando.cliente?.nombre} {pedidoEditando.cliente?.apellido}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Fecha:</span> 
                    <span className="font-medium text-foreground">{new Date(pedidoEditando.fechaReserva + 'T00:00:00').toLocaleDateString('es-ES')}</span>
                  </p>
                </div>

                {/* Lista de Items a Entregar */}
                <div>
                  <label className="block text-sm mb-2 text-foreground font-bold flex items-center gap-2">
                    <FileText size={16} className="text-accent" /> Detalle de Productos a Entregar
                  </label>
                  <div className="bg-background border border-border rounded-lg max-h-40 overflow-y-auto p-2 space-y-2">
                    {pedidoEditando.items?.map((item) => (
                      <div key={item.idItemComprado} className="flex justify-between items-center text-sm p-2 bg-muted/30 rounded border border-border/50">
                        <span className="font-medium text-foreground">
                          <span className="bg-accent/10 text-accent font-black px-1.5 py-0.5 rounded mr-2">x{item.cantidad}</span>
                          {item.producto?.nombre}
                        </span>
                        <span className="text-muted-foreground font-mono">
                          {formatCurrency(item.precioUnitarioHistorial * item.cantidad)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end mt-2">
                    <span className="text-lg font-black text-accent">Total: {formatCurrency(pedidoEditando.montoTotal)}</span>
                  </div>
                </div>

                {/* Selector de Estado */}
                <div>
                  <label className="block text-sm mb-2 text-foreground font-bold flex items-center gap-2">
                    <CheckCircle size={16} /> Estado del Pedido
                  </label>
                  <select
                    value={nuevoEstado}
                    onChange={(e) => setNuevoEstado(e.target.value)}
                    className="w-full px-4 py-3 bg-input-background border border-input rounded-lg text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                    disabled={pedidoEditando.estadoRecojo === 'CANCELADO'} // Bloquear si ya fue cancelado
                  >
                    <option value="PENDIENTE">Pendiente (Por Recoger)</option>
                    <option value="RECOGIDO">Entregado / Completado</option>
                    {/* Solo permitimos cancelar si no estaba ya cancelado, para no confundir al usuario */}
                    {pedidoEditando.estadoRecojo !== 'RECOGIDO' && <option value="CANCELADO">Cancelar y devolver stock</option>}
                  </select>
                  {pedidoEditando.estadoRecojo === 'CANCELADO' && (
                    <p className="text-xs text-red-500 mt-2 font-medium">Este pedido fue anulado y el stock ya ha sido retornado al inventario. No se puede modificar.</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <Button variant="ghost" className="flex-1" onClick={() => setModalAbierto(false)}>Cerrar</Button>
              <Button variant="accent" className="flex-1 font-bold" onClick={guardarCambios} disabled={pedidoEditando?.estadoRecojo === 'CANCELADO'}>
                Guardar Cambios
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};
