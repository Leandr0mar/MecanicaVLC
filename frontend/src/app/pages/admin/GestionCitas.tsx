import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/button';
// Se añadió el icono Download
import { Calendar, Clock, Edit2, Trash2, AlertCircle, PlayCircle, CheckCircle, XCircle, Filter, Wrench, Download, Banknote } from 'lucide-react';
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
  cliente: { nombre: string; apellido: string; telefono: string };
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
        const prioridad = (cita: Cita) => {
          const estado = cita.estado?.toUpperCase();
          if (estado === 'PENDIENTE') return 0;
          if (estado === 'EN_PROGRESO') return 1;
          if (estado === 'COMPLETADA' && !cita.pagoRegistrado) return 2;
          if (estado === 'COMPLETADA') return 3;
          if (estado === 'CANCELADA') return 4;
          return 5;
        };
        const ordenadas = dataCitas.sort((a: Cita, b: Cita) => {
          const diferenciaEstado = prioridad(a) - prioridad(b);
          if (diferenciaEstado !== 0) return diferenciaEstado;
          const fechaA = new Date(`${a.fecha}T${a.hora}`).getTime();
          const fechaB = new Date(`${b.fecha}T${b.hora}`).getTime();
          return prioridad(a) <= 1 ? fechaA - fechaB : fechaB - fechaA;
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
          <Dialog.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 duration-200 fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-2xl">
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

      {/* MODAL HÍBRIDO (ESTADO + TRABAJADOR) */}
      <Dialog.Root open={modalAbierto} onOpenChange={setModalAbierto}>
        <Dialog.Portal>
          <Dialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 duration-200 fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 duration-200 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl">
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
