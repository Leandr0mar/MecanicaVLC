import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/button';
import { Calendar, Clock, Edit2, Trash2, AlertCircle, PlayCircle, CheckCircle, XCircle, Filter, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';
import { formatCurrency } from '../../utils/currency';
import { API_URL } from '../../context/AuthContext';

interface Cita {
  idCita: number;
  fecha: string;
  hora: string;
  estado: string;
  montoInicial: number;
  cliente: { nombre: string; apellido: string; telefono: string };
  trabajador?: { idUsuario: number; nombre: string; apellido: string };
  servicio: { nombreServicio: string };
}

export const GestionCitas = () => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [trabajadores, setTrabajadores] = useState<any[]>([]); // Lista de mecánicos
  const [loading, setLoading] = useState(true);
  
  const [filtroEstado, setFiltroEstado] = useState<string | 'TODAS'>('TODAS');
  
  // Estados para el Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [citaEditando, setCitaEditando] = useState<Cita | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState<string>('');
  const [nuevoTrabajadorId, setNuevoTrabajadorId] = useState<number>(0);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Hacemos peticiones en paralelo: Las citas y los usuarios
      const [resCitas, resUsuarios] = await Promise.all([
        fetch(`${API_URL}/api/citas`, { credentials: 'include' }),
        fetch(`${API_URL}/api/usuarios`, { credentials: 'include' })
      ]);

      if (resCitas.status === 401) return (window.location.href = '/iniciar-sesion');
      
      if (resCitas.ok) {
        const dataCitas = await resCitas.json();
        const ordenadas = dataCitas.sort((a: Cita, b: Cita) => 
          new Date(`${b.fecha}T${b.hora}`).getTime() - new Date(`${a.fecha}T${a.hora}`).getTime()
        );
        setCitas(ordenadas);
      }

      if (resUsuarios.ok) {
        const dataUsuarios = await resUsuarios.json();
        // Filtramos solo los que tienen rol 2 (Trabajadores)
        setTrabajadores(dataUsuarios.filter((u: any) => u.rol === 2));
      }

    } catch (error) {
      toast.error('Error al cargar la información del sistema');
    } finally {
      setLoading(false);
    }
  };

  const eliminar = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar esta cita permanentemente?')) return;
    try {
      const res = await fetch(`${API_URL}/api/citas/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.status === 401) return (window.location.href = '/iniciar-sesion');
      if (!res.ok) throw new Error('Error');
      await cargarDatos();
      toast.success('Cita eliminada correctamente');
    } catch (error) {
      toast.error('No se pudo eliminar la cita');
    }
  };

  const abrirModalEdicion = (cita: Cita) => {
    setCitaEditando(cita);
    setNuevoEstado(cita.estado);
    setNuevoTrabajadorId(cita.trabajador?.idUsuario || 0); // Cargamos el trabajador actual
    setModalAbierto(true);
  };

  const guardarCambios = async () => {
    if (!citaEditando) return;
    
    try {
      const idCita = citaEditando.idCita;
      let actualizacionRealizada = false;

      // 1. Si el estado cambió, lo actualizamos
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

      // 2. Si el trabajador cambió (y no es 0), lo actualizamos
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
        await cargarDatos(); // Recargar la tabla
      }
      
      setModalAbierto(false);
    } catch (error) {
      toast.error('Ocurrió un error al guardar los cambios');
    }
  };

  const getEstadoUI = (estado: string) => {
    switch (estado?.toUpperCase()) {
      case 'PENDIENTE': return { icon: AlertCircle, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400', label: 'Pendiente' };
      case 'EN_PROGRESO': return { icon: PlayCircle, color: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400', label: 'En Progreso' };
      case 'COMPLETADA': return { icon: CheckCircle, color: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400', label: 'Completada' };
      case 'CANCELADA': return { icon: XCircle, color: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400', label: 'Cancelada' };
      default: return { icon: AlertCircle, color: 'bg-muted text-muted-foreground', label: estado };
    }
  };

  const citasFiltradas = citas.filter(cita => filtroEstado === 'TODAS' || cita.estado === filtroEstado);

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="mb-2 text-foreground">Gestión de Citas</h2>
          <p className="text-muted-foreground">Monitor general y asignación de personal</p>
        </div>
        
        <div className="flex bg-card border border-border p-1 rounded-lg overflow-x-auto">
          <Button variant={filtroEstado === 'TODAS' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFiltroEstado('TODAS')} className="text-xs">Todas</Button>
          <Button variant={filtroEstado === 'PENDIENTE' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFiltroEstado('PENDIENTE')} className="text-xs text-yellow-600 dark:text-yellow-400">Pendientes</Button>
          <Button variant={filtroEstado === 'EN_PROGRESO' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFiltroEstado('EN_PROGRESO')} className="text-xs text-blue-600 dark:text-blue-400">En Progreso</Button>
          <Button variant={filtroEstado === 'COMPLETADA' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFiltroEstado('COMPLETADA')} className="text-xs text-green-600 dark:text-green-400">Completadas</Button>
          <Button variant={filtroEstado === 'CANCELADA' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFiltroEstado('CANCELADA')} className="text-xs text-red-600 dark:text-red-400">Canceladas</Button>
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
                <th className="text-left p-4 text-foreground">Servicio & Monto</th>
                <th className="text-left p-4 text-foreground">Trabajador Asignado</th>
                <th className="text-center p-4 text-foreground">Estado</th>
                <th className="text-right p-4 text-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {citasFiltradas.map((cita) => {
                const ui = getEstadoUI(cita.estado);
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
                      <div className="text-xs text-accent font-bold mt-1">{formatCurrency(cita.montoInicial || 0)}</div>
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
                        <button onClick={() => abrirModalEdicion(cita)} className="p-2 hover:bg-muted rounded-lg text-foreground transition-colors" title="Editar Estado y Trabajador">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => eliminar(cita.idCita)} className="p-2 hover:bg-destructive/20 text-destructive rounded-lg transition-colors" title="Eliminar Cita">
                          <Trash2 size={16} />
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

      {/* MODAL HÍBRIDO (ESTADO + TRABAJADOR) */}
      <Dialog.Root open={modalAbierto} onOpenChange={setModalAbierto}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl">
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
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="EN_PROGRESO">En Progreso</option>
                    <option value="COMPLETADA">Completada</option>
                    <option value="CANCELADA">Cancelada</option>
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