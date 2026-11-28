import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/button';
// Se añadió el icono Download
import { Calendar, Clock, Edit2, Trash2, AlertCircle, PlayCircle, CheckCircle, XCircle, Filter, Wrench, Download, Banknote, ReceiptText } from 'lucide-react';
import { toast } from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';
import { formatCurrency } from '../../utils/currency';
import { API_URL } from '../../context/AuthContext';
// Importamos la librería para Excel
import * as XLSX from 'xlsx';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';
import { AdminSearchInput } from '../../components/ui/AdminSearchInput';

interface Cita {
  idCita: number;
  fecha: string;
  hora: string;
  estado: string;
  montoInicial: number;
  pagoRegistrado?: boolean;
  montoPagado?: number;
  metodoPago?: string;
  fechaPago?: string;
  observaciones?: string;
  cliente: {
    nombre: string; apellido: string; telefono: string; tipoDocumento?: string; numeroDocumento?: string;
    dni?: string; email?: string; direccion?: string; placaMototaxi?: string; marcaMototaxi?: string; modeloMototaxi?: string;
  };
  trabajador?: { idUsuario: number; nombre: string; apellido: string };
  servicio: { nombreServicio: string };
}

export const GestionCitas = () => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [trabajadores, setTrabajadores] = useState<any[]>([]); // Lista de mecánicos
  const [loading, setLoading] = useState(true);
  
  const [filtroEstado, setFiltroEstado] = useState<string | 'TODAS'>('TODAS');
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalCitas, setTotalCitas] = useState(0);
  const busquedaInicial = useRef(true);
  
  // Estados para el Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [citaEditando, setCitaEditando] = useState<Cita | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState<string>('');
  const [nuevoTrabajadorId, setNuevoTrabajadorId] = useState<number>(0);
  const [citaPago, setCitaPago] = useState<Cita | null>(null);
  const [montoPago, setMontoPago] = useState('');
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [boletaCita, setBoletaCita] = useState<Cita | null>(null);
  const [cargandoBoleta, setCargandoBoleta] = useState(false);

  const calcularImportes = (cita: Cita) => {
    const total = Math.round(Number(cita.montoPagado ?? 0) * 100) / 100;
    const base = Math.round((total / 1.18) * 100) / 100;
    return { total, base, igv: Math.round((total - base) * 100) / 100 };
  };

  const abrirBoleta = async (cita: Cita) => {
    setCargandoBoleta(true);
    try {
      const response = await fetch(`${API_URL}/api/citas/${cita.idCita}`, { credentials: 'include' });
      if (response.status === 401) return (window.location.href = '/iniciar-sesion');
      if (!response.ok) throw new Error('No se pudo cargar la boleta');
      const detalle: Cita = await response.json();
      if (!detalle.pagoRegistrado) throw new Error('La cita todavía no tiene un pago registrado');
      setBoletaCita(detalle);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo cargar la boleta');
    } finally {
      setCargandoBoleta(false);
    }
  };

  const exportarBoletaPDF = (cita: Cita) => {
    const ventana = window.open('', '_blank');
    if (!ventana) return toast.error('Permite las ventanas emergentes para exportar la boleta');
    const escapar = (valor: string) => valor.replace(/[&<>"']/g, (caracter) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[caracter] as string);
    const { total, base, igv } = calcularImportes(cita);
    const cliente = cita.cliente;
    const fila = (etiqueta: string, valor?: string) => `<tr><td>${escapar(etiqueta)}</td><td>${escapar(valor || 'No disponible')}</td></tr>`;
    const numero = `B001-${String(cita.idCita).padStart(8, '0')}`;
    const fechaPago = cita.fechaPago ? new Date(cita.fechaPago).toLocaleString('es-PE') : 'No disponible';
    ventana.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Boleta ${escapar(numero)}</title><style>*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#172033;margin:0;padding:36px;background:#f1f5f9}.receipt{max-width:760px;margin:auto;background:#fff;padding:42px;border:1px solid #dbe2ea;border-radius:12px}header{display:flex;justify-content:space-between;gap:24px;border-bottom:2px solid #c59d36;padding-bottom:20px;margin-bottom:24px}h1{font-size:22px;margin:0 0 6px}h2{font-size:14px;text-transform:uppercase;color:#475569;margin:25px 0 8px}p{font-size:13px;color:#475569}.number{text-align:right;color:#9a7620}.number strong{display:block;font-size:20px}table{width:100%;border-collapse:collapse;font-size:13px}td{padding:9px 4px;border-bottom:1px solid #e5e7eb}td:first-child{color:#64748b;width:38%}.amounts{width:320px;margin:20px 0 0 auto}.amounts tr:last-child{font-size:17px;font-weight:bold}@media print{body{background:white;padding:0}.receipt{border:0;border-radius:0;max-width:none;padding:20px}}</style></head><body><main class="receipt"><header><div><h1>Boleta de venta electrónica</h1><p>VLC Motors · RUC: 20123456789</p><p>Fecha de emisión: ${escapar(fechaPago)}</p></div><div class="number">N.º BOLETA<strong>${escapar(numero)}</strong></div></header><h2>Cliente</h2><table>${fila('Nombre', `${cliente?.nombre ?? ''} ${cliente?.apellido ?? ''}`.trim())}${fila('Documento', `${cliente?.tipoDocumento || (cliente?.dni ? 'DNI' : 'Documento')}: ${cliente?.numeroDocumento || cliente?.dni || ''}`)}${fila('Teléfono', cliente?.telefono)}${fila('Dirección', cliente?.direccion)}</table><h2>Detalle</h2><table>${fila('Servicio', cita.servicio?.nombreServicio)}${fila('Fecha de atención', new Date(`${cita.fecha}T00:00:00`).toLocaleDateString('es-PE'))}${fila('Hora', cita.hora?.substring(0, 5))}</table><h2>Pago</h2><table>${fila('Fecha de pago', fechaPago)}${fila('Medio de pago', cita.metodoPago?.replace('_', ' ').toLowerCase())}</table><table class="amounts"><tr><td>Valor de venta</td><td>${formatCurrency(base)}</td></tr><tr><td>IGV (18%, incluido)</td><td>${formatCurrency(igv)}</td></tr><tr><td>Total pagado</td><td>${formatCurrency(total)}</td></tr></table></main><script>window.onload=()=>{window.focus();window.print()}</script></body></html>`);
    ventana.document.close();
  };

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
      if (!citas.length) setLoading(true);
      
      const parametros = new URLSearchParams({ pagina: String(pagina), tamano: '20', q: busqueda.trim() });
      if (filtroEstado !== 'TODAS') parametros.set('estado', filtroEstado);
      const [resCitas, resUsuarios] = await Promise.all([
        fetch(`${API_URL}/api/citas/pagina?${parametros}`, { credentials: 'include' }),
        fetch(`${API_URL}/api/usuarios/pagina?pagina=0&tamano=100&rol=2`, { credentials: 'include' })
      ]);

      if (resCitas.status === 401) return (window.location.href = '/iniciar-sesion');
      
      if (resCitas.ok) {
        const paginaRespuesta = await resCitas.json();
        if (pagina > 0 && pagina >= (paginaRespuesta.totalPaginas ?? 0)) {
          setPagina(Math.max(0, (paginaRespuesta.totalPaginas ?? 0) - 1));
          return;
        }
        const dataCitas = paginaRespuesta.contenido ?? [];
        const ordenadas = dataCitas.sort((a: Cita, b: Cita) => {
          const fechaA = new Date(`${a.fecha}T${a.hora}`).getTime();
          const fechaB = new Date(`${b.fecha}T${b.hora}`).getTime();
          return fechaB - fechaA;
        });
        setCitas(ordenadas);
        setTotalPaginas(paginaRespuesta.totalPaginas ?? 0);
        setTotalCitas(paginaRespuesta.totalElementos ?? 0);
      }

      if (resUsuarios.ok) {
        const dataUsuarios = await resUsuarios.json();
        setTrabajadores(dataUsuarios.contenido ?? []);
      }

    } catch (error) {
      toast.error('Error al cargar la información del sistema');
    } finally {
      setLoading(false);
    }
  };

  const eliminar = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/citas/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.status === 401) return (window.location.href = '/iniciar-sesion');
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || 'No se pudo eliminar la cita');
      }
      await cargarDatos();
      toast.success('Cita eliminada correctamente');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo eliminar la cita');
    }
  };

  const abrirModalEdicion = (cita: Cita) => {
    setCitaEditando(cita);
    setNuevoEstado(cita.estado);
    setNuevoTrabajadorId(cita.trabajador?.idUsuario || 0);
    setModalAbierto(true);
  };

  const guardarCambios = async () => {
    if (!citaEditando) return;
    
    try {
      const idCita = citaEditando.idCita;
      let actualizacionRealizada = false;

      if (nuevoEstado !== citaEditando.estado) {
        const resEstado = await fetch(`${API_URL}/api/citas/${idCita}/estado`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ estado: nuevoEstado })
        });
        if (!resEstado.ok) throw new Error('Error al actualizar estado');
        actualizacionRealizada = true;
      }

      const idTrabajadorActual = citaEditando.trabajador?.idUsuario || 0;
      if (nuevoTrabajadorId !== idTrabajadorActual && nuevoTrabajadorId !== 0) {
        const resTrabajador = await fetch(`${API_URL}/api/citas/${idCita}/trabajador`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ idTrabajador: nuevoTrabajadorId })
        });
        if (!resTrabajador.ok) throw new Error('Error al reasignar trabajador');
        actualizacionRealizada = true;
      }

      if (actualizacionRealizada) {
        toast.success('Cambios guardados correctamente');
        await cargarDatos();
      }
      
      setModalAbierto(false);
    } catch (error) {
      toast.error('Ocurrió un error al guardar los cambios');
    }
  };

  const registrarPago = async () => {
    if (!citaPago || montoPago.trim() === '' || !Number.isFinite(Number(montoPago)) || Number(montoPago) < 0) {
      toast.error('Ingresa un monto válido para el pago presencial');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/citas/${citaPago.idCita}/pago`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ montoPagado: Number(montoPago), metodoPago }),
      });
      if (response.status === 401) return (window.location.href = '/iniciar-sesion');
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error || 'No se pudo registrar el pago');
      toast.success('Pago presencial registrado');
      setCitaPago(null);
      await cargarDatos();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo registrar el pago');
    }
  };

  const getEstadoUI = (cita: Cita) => {
    const estado = cita.estado;
    switch (estado?.toUpperCase()) {
      case 'PENDIENTE': return { icon: AlertCircle, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400', label: 'Pendiente' };
      case 'EN_PROGRESO': return { icon: PlayCircle, color: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400', label: 'En Progreso' };
      case 'COMPLETADA': return cita.pagoRegistrado
        ? { icon: CheckCircle, color: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400', label: 'Completada' }
        : { icon: Banknote, color: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400', label: 'Completada · pendiente de pago' };
      case 'CANCELADA': return { icon: XCircle, color: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400', label: 'Cancelada' };
      default: return { icon: AlertCircle, color: 'bg-muted text-muted-foreground', label: estado };
    }
  };

  const citasFiltradas = citas;

  // --- NUEVA LÓGICA: EXPORTAR A EXCEL ---
  const exportarExcel = async () => {
    if (totalCitas === 0) {
      return toast.error('No hay citas para exportar bajo el filtro actual');
    }

    const params = new URLSearchParams({ pagina: '0', tamano: '100', q: busqueda.trim() });
    if (filtroEstado !== 'TODAS') params.set('estado', filtroEstado);
    const inicial = await fetch(`${API_URL}/api/citas/pagina?${params}`, { credentials: 'include' });
    if (!inicial.ok) return toast.error('No se pudo preparar la exportación de citas');
    const primeraPagina = await inicial.json();
    const citasExportar: Cita[] = [...(primeraPagina.contenido ?? [])];
    for (let numero = 1; numero < (primeraPagina.totalPaginas ?? 0); numero += 1) {
      params.set('pagina', String(numero));
      const siguiente = await fetch(`${API_URL}/api/citas/pagina?${params}`, { credentials: 'include' });
      if (!siguiente.ok) return toast.error('No se pudo completar la exportación de citas');
      citasExportar.push(...((await siguiente.json()).contenido ?? []));
    }

    const datosExcel = citasExportar.map((cita) => {
      return {
        'ID Cita': cita.idCita,
        'Fecha': new Date(cita.fecha + 'T00:00:00').toLocaleDateString('es-ES'),
        'Hora': cita.hora.substring(0, 5),
        'Estado': cita.estado.replace('_', ' '),
        'Cliente': `${cita.cliente?.nombre} ${cita.cliente?.apellido}`,
        'Teléfono': cita.cliente?.telefono,
        'Servicio': cita.servicio?.nombreServicio,
        'Monto Inicial (S/.)': cita.montoInicial || 0,
        'Pago Registrado': cita.pagoRegistrado ? 'Sí' : 'No',
        'Monto Cobrado (S/.)': cita.montoPagado ?? '',
        'Método de Pago': cita.metodoPago || '',
        'Fecha de Pago': cita.fechaPago || '',
        'Trabajador Asignado': cita.trabajador ? `${cita.trabajador.nombre} ${cita.trabajador.apellido}` : 'Sin asignar'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(datosExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Citas');

    const wscols = [
      { wch: 10 }, // ID Cita
      { wch: 15 }, // Fecha
      { wch: 10 }, // Hora
      { wch: 15 }, // Estado
      { wch: 35 }, // Cliente
      { wch: 15 }, // Teléfono
      { wch: 35 }, // Servicio
      { wch: 20 }, // Monto
      { wch: 35 }  // Trabajador
    ];
    worksheet['!cols'] = wscols;

    XLSX.writeFile(workbook, `Reporte_Citas_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Excel exportado correctamente');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="mb-2 text-foreground">Gestión de Citas</h2>
          <p className="text-muted-foreground">Monitor general y asignación de personal</p>
        </div>
        
        <AdminSearchInput value={busqueda} onChange={setBusqueda} placeholder="Buscar por cliente, servicio, trabajador o fecha..." className="xl:mx-6" />

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* --- BOTÓN DE EXPORTACIÓN --- */}
          <Button variant="secondary" onClick={exportarExcel} className="gap-2 bg-green-600/10 text-green-600 hover:bg-green-600/20 hover:text-green-700 dark:text-green-400 border border-green-600/20 h-10">
            <Download size={16} />
            Exportar Excel
          </Button>

          <div className="flex bg-card border border-border p-1 rounded-lg overflow-x-auto">
            <Button variant={filtroEstado === 'TODAS' ? 'secondary' : 'ghost'} size="sm" onClick={() => { setPagina(0); setFiltroEstado('TODAS'); }} className="text-xs">Todas</Button>
            <Button variant={filtroEstado === 'PENDIENTE' ? 'secondary' : 'ghost'} size="sm" onClick={() => { setPagina(0); setFiltroEstado('PENDIENTE'); }} className="text-xs text-yellow-600 dark:text-yellow-400">Pendientes</Button>
            <Button variant={filtroEstado === 'EN_PROGRESO' ? 'secondary' : 'ghost'} size="sm" onClick={() => { setPagina(0); setFiltroEstado('EN_PROGRESO'); }} className="text-xs text-blue-600 dark:text-blue-400">En Progreso</Button>
            <Button variant={filtroEstado === 'COMPLETADA' ? 'secondary' : 'ghost'} size="sm" onClick={() => { setPagina(0); setFiltroEstado('COMPLETADA'); }} className="text-xs text-green-600 dark:text-green-400">Completadas</Button>
            <Button variant={filtroEstado === 'CANCELADA' ? 'secondary' : 'ghost'} size="sm" onClick={() => { setPagina(0); setFiltroEstado('CANCELADA'); }} className="text-xs text-red-600 dark:text-red-400">Canceladas</Button>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Cargando agenda global...</div>
        ) : citasFiltradas.length === 0 ? (
          <div className="text-center p-12 bg-card">
            <Filter size={40} className="mx-auto mb-3 opacity-20" />
            <p className="text-muted-foreground">No se encontraron citas bajo este filtro.</p>
          </div>
        ) : (
          <table className="w-full min-w-[900px]">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4 text-foreground">Fecha y Hora</th>
                <th className="text-left p-4 text-foreground">Cliente</th>
                <th className="text-left p-4 text-foreground">Servicio y pago</th>
                <th className="text-left p-4 text-foreground">Trabajador Asignado</th>
                <th className="text-center p-4 text-foreground">Estado</th>
                <th className="text-right p-4 text-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {citasFiltradas.map((cita) => {
                const ui = getEstadoUI(cita);
                const Icon = ui.icon;
                return (
                  <tr key={cita.idCita} className="border-t border-border hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-foreground flex items-center gap-2">
                        <Calendar size={14} className="text-muted-foreground" />
                        {new Date(cita.fecha + 'T00:00:00').toLocaleDateString('es-ES')}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                        <Clock size={14} />
                        {cita.hora.substring(0, 5)} hs
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-foreground">{cita.cliente?.nombre} {cita.cliente?.apellido}</div>
                      <div className="text-xs text-muted-foreground">Tel: {cita.cliente?.telefono}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-foreground">{cita.servicio?.nombreServicio}</div>
                      <div className="text-xs text-muted-foreground mt-1">Referencial: {formatCurrency(cita.montoInicial || 0)}</div>
                      {cita.pagoRegistrado ? (
                        <div className="text-xs text-green-600 dark:text-green-400 font-semibold mt-1">
                          Cobrado: {formatCurrency(cita.montoPagado || 0)} · {cita.metodoPago?.replace('_', ' ').toLowerCase()}
                        </div>
                      ) : (
                        <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">{cita.estado?.toUpperCase() === 'COMPLETADA' ? 'Servicio completado · pago presencial pendiente' : 'Sin pago registrado'}</div>
                      )}
                    </td>
                    <td className="p-4">
                      {cita.trabajador ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent">
                            {cita.trabajador.nombre.charAt(0)}{cita.trabajador.apellido.charAt(0)}
                          </div>
                          <span className="text-sm text-foreground">{cita.trabajador.nombre} {cita.trabajador.apellido}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic bg-muted px-2 py-1 rounded">Sin asignar</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${ui.color}`}>
                        <Icon size={14} />
                        {ui.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-end">
                        {cita.estado === 'COMPLETADA' && cita.pagoRegistrado && (
                          <button onClick={() => void abrirBoleta(cita)} disabled={cargandoBoleta} className="p-2 rounded-lg text-accent hover:bg-accent/10 disabled:opacity-50" title="Ver boleta de pago" aria-label={`Ver boleta de pago de la cita ${cita.idCita}`}>
                            <ReceiptText size={16} />
                          </button>
                        )}
                        {cita.estado === 'COMPLETADA' && !cita.pagoRegistrado && (
                          <button
                            onClick={() => { setCitaPago(cita); setMontoPago(String(cita.montoInicial ?? '')); setMetodoPago('EFECTIVO'); }}
                            className="p-2 rounded-lg text-green-700 hover:bg-green-500/10 dark:text-green-400"
                            title="Registrar pago presencial"
                            aria-label={`Registrar pago de la cita ${cita.idCita}`}
                          >
                            <Banknote size={16} />
                          </button>
                        )}
                        <button onClick={() => abrirModalEdicion(cita)} className="p-2 hover:bg-muted rounded-lg text-foreground transition-colors" title="Editar Estado y Trabajador">
                          <Edit2 size={16} />
                        </button>
                        <ConfirmDeleteDialog itemName={`la cita del ${cita.fecha}`} onConfirm={() => eliminar(cita.idCita)}>
                          <button className="p-2 hover:bg-destructive/20 text-destructive rounded-lg transition-colors" title="Eliminar Cita" aria-label={`Eliminar cita del ${cita.fecha}`}>
                            <Trash2 size={16} />
                          </button>
                        </ConfirmDeleteDialog>
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
        <span>{totalCitas === 0 ? 'Sin citas' : `Mostrando ${pagina * 20 + 1}–${Math.min((pagina + 1) * 20, totalCitas)} de ${totalCitas} citas`}</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={pagina === 0 || loading} onClick={() => setPagina((actual) => Math.max(0, actual - 1))}>Anterior</Button>
          <span>Página {totalPaginas === 0 ? 0 : pagina + 1} de {totalPaginas}</span>
          <Button variant="outline" size="sm" disabled={pagina + 1 >= totalPaginas || loading} onClick={() => setPagina((actual) => actual + 1)}>Siguiente</Button>
        </div>
      </div>

      <Dialog.Root open={Boolean(citaPago)} onOpenChange={(open) => !open && setCitaPago(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 duration-200 fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <Dialog.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 duration-200 fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-2xl sm:p-6">
            <Dialog.Title className="mb-2 text-lg font-bold text-card-foreground">Registrar pago presencial</Dialog.Title>
            <p className="mb-5 text-sm text-muted-foreground">Registra el importe recibido en el taller por {citaPago?.servicio?.nombreServicio}.</p>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-foreground">
                Monto recibido (S/)
                <input type="number" min="0" step="0.01" value={montoPago} onChange={(event) => setMontoPago(event.target.value)} className="mt-1 w-full rounded-lg border border-input bg-input-background px-3 py-2.5 text-foreground" />
              </label>
              <label className="block text-sm font-medium text-foreground">
                Método de pago
                <select value={metodoPago} onChange={(event) => setMetodoPago(event.target.value)} className="mt-1 w-full rounded-lg border border-input bg-input-background px-3 py-2.5 text-foreground">
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TARJETA">Tarjeta en el local</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                  <option value="YAPE">Yape</option>
                  <option value="PLIN">Plin</option>
                  <option value="BILLETERA_DIGITAL">Billetera digital</option>
                  <option value="OTRO">Otro</option>
                </select>
              </label>
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setCitaPago(null)}>Cancelar</Button>
              <Button variant="accent" className="flex-1" onClick={registrarPago}>Confirmar pago</Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={Boolean(boletaCita)} onOpenChange={(open) => !open && setBoletaCita(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 duration-200 fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 duration-200 fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-2xl sm:p-7">
            {boletaCita && (() => {
              const { total, base, igv } = calcularImportes(boletaCita);
              const cliente = boletaCita.cliente;
              const numero = `B001-${String(boletaCita.idCita).padStart(8, '0')}`;
              return <>
                <div className="mb-5 flex items-start justify-between gap-4 border-b border-border pb-4">
                  <div><Dialog.Title className="text-xl font-bold text-card-foreground">Boleta de venta electrónica</Dialog.Title><Dialog.Description className="mt-1 text-sm text-muted-foreground">VLC Motors · RUC: 20123456789 · Boleta N.º {numero}</Dialog.Description><p className="mt-1 text-xs text-muted-foreground">Av. Ejemplo 123, Lima, Perú</p></div>
                  <ReceiptText className="text-accent" size={28} />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <section className="space-y-1 text-sm"><h3 className="mb-2 font-semibold text-foreground">Cliente</h3><p className="text-muted-foreground">{cliente?.nombre} {cliente?.apellido}</p><p className="text-muted-foreground">{cliente?.tipoDocumento || 'Documento'}: {cliente?.numeroDocumento || cliente?.dni || 'No disponible'}</p><p className="text-muted-foreground">Teléfono: {cliente?.telefono || 'No disponible'}</p><p className="break-all text-muted-foreground">Correo: {cliente?.email || 'No disponible'}</p><p className="text-muted-foreground">Dirección: {cliente?.direccion || 'No disponible'}</p></section>
                  <section className="space-y-1 text-sm"><h3 className="mb-2 font-semibold text-foreground">Cita y vehículo</h3><p className="text-muted-foreground">Servicio: {boletaCita.servicio?.nombreServicio}</p><p className="text-muted-foreground">Fecha: {new Date(`${boletaCita.fecha}T00:00:00`).toLocaleDateString('es-PE')}</p><p className="text-muted-foreground">Hora: {boletaCita.hora?.substring(0, 5)}</p><p className="text-muted-foreground">Trabajador: {boletaCita.trabajador ? `${boletaCita.trabajador.nombre} ${boletaCita.trabajador.apellido}` : 'No asignado'}</p><p className="text-muted-foreground">Vehículo: {[cliente?.marcaMototaxi, cliente?.modeloMototaxi].filter(Boolean).join(' ') || 'No disponible'}</p><p className="text-muted-foreground">Placa: {cliente?.placaMototaxi || 'No disponible'}</p></section>
                </div>
                {boletaCita.observaciones && <div className="mt-4 rounded-lg bg-muted p-3 text-sm"><span className="font-medium">Observaciones:</span> {boletaCita.observaciones}</div>}
                <section className="mt-5 rounded-lg border border-border p-4"><h3 className="mb-3 font-semibold text-foreground">Pago presencial</h3><div className="space-y-2 text-sm"><div className="flex justify-between gap-4"><span className="text-muted-foreground">Método</span><span className="font-medium capitalize">{boletaCita.metodoPago?.replace('_', ' ').toLowerCase() || 'No disponible'}</span></div><div className="flex justify-between gap-4"><span className="text-muted-foreground">Fecha de pago</span><span>{boletaCita.fechaPago ? new Date(boletaCita.fechaPago).toLocaleString('es-PE') : 'No disponible'}</span></div><div className="flex justify-between gap-4"><span className="text-muted-foreground">Valor de venta</span><span>{formatCurrency(base)}</span></div><div className="flex justify-between gap-4"><span className="text-muted-foreground">IGV (18%, incluido)</span><span>{formatCurrency(igv)}</span></div><div className="flex justify-between gap-4 border-t border-border pt-2 text-base font-bold"><span>Total pagado</span><span className="text-accent">{formatCurrency(total)}</span></div></div></section>
                <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button variant="ghost" onClick={() => setBoletaCita(null)}>Cerrar</Button><Button variant="accent" onClick={() => exportarBoletaPDF(boletaCita)}><Download size={16} /> Exportar PDF</Button></div>
              </>;
            })()}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* MODAL HÍBRIDO (ESTADO + TRABAJADOR) */}
      <Dialog.Root open={modalAbierto} onOpenChange={setModalAbierto}>
        <Dialog.Portal>
          <Dialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 duration-200 fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 duration-200 fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-2xl sm:p-6">
            <Dialog.Title className="mb-2 text-card-foreground text-lg font-bold">
              Gestionar Cita Híbrida
            </Dialog.Title>
            <p className="text-sm text-muted-foreground mb-6">
              Actualiza el progreso y asignación del servicio
            </p>

            {citaEditando && (
              <div className="space-y-5">
                <div className="p-4 bg-muted/50 rounded-lg text-sm border border-border">
                  <p className="flex justify-between mb-2"><span className="text-muted-foreground">Cliente:</span> <span className="font-medium text-foreground">{citaEditando.cliente?.nombre} {citaEditando.cliente?.apellido}</span></p>
                  <p className="flex justify-between"><span className="text-muted-foreground">Servicio:</span> <span className="font-medium text-foreground">{citaEditando.servicio?.nombreServicio}</span></p>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-foreground font-medium flex items-center gap-2">
                    <AlertCircle size={14} /> Estado de la Cita
                  </label>
                  <select
                    value={nuevoEstado}
                    onChange={(e) => setNuevoEstado(e.target.value)}
                    className="w-full px-4 py-2.5 bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {citaEditando.estado === 'PENDIENTE' && <>
                      <option value="PENDIENTE">Pendiente</option>
                      <option value="EN_PROGRESO">En Progreso</option>
                      <option value="CANCELADA">Cancelada</option>
                    </>}
                    {citaEditando.estado === 'EN_PROGRESO' && <>
                      <option value="EN_PROGRESO">En Progreso</option>
                      <option value="COMPLETADA">Completada</option>
                      <option value="CANCELADA">Cancelada</option>
                    </>}
                    {citaEditando.estado === 'COMPLETADA' && <option value="COMPLETADA">Completada</option>}
                    {citaEditando.estado === 'CANCELADA' && <option value="CANCELADA">Cancelada</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-foreground font-medium flex items-center gap-2">
                    <Wrench size={14} /> Trabajador Asignado (Anulación Manual)
                  </label>
                  <select
                    value={nuevoTrabajadorId}
                    onChange={(e) => setNuevoTrabajadorId(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value={0}>Seleccionar trabajador...</option>
                    {trabajadores.map(trabajador => (
                      <option key={trabajador.idUsuario} value={trabajador.idUsuario}>
                        {trabajador.nombre} {trabajador.apellido}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <Button variant="ghost" className="flex-1" onClick={() => setModalAbierto(false)}>Cancelar</Button>
              <Button variant="accent" className="flex-1" onClick={guardarCambios}>Guardar Cambios</Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};
