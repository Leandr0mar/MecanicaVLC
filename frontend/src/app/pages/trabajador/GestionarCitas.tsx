import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/button';
import { User, Phone, Mail, CheckCircle, Calendar, Clock, AlertCircle, PlayCircle, XCircle, FileText, Edit3 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import * as Dialog from '@radix-ui/react-dialog'; // <-- Nuevo Import
import { API_URL } from '../../context/AuthContext';

interface Cita {
  idCita: number;
  fecha: string;
  hora: string;
  estado: string; // "PENDIENTE", "EN_PROGRESO", "COMPLETADA", "CANCELADA"
  observaciones?: string;
  cliente: {
    nombre: string;
    apellido: string;
    telefono: string;
    email: string;
    placaMototaxi: string;
  };
  servicio: {
    nombreServicio: string;
  };
}

export const GestionarCitas = () => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);

  // --- NUEVOS ESTADOS PARA MODAL DE OBSERVACIONES ---
  const [modalAbierto, setModalAbierto] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);
  const [textoObservacion, setTextoObservacion] = useState('');

  useEffect(() => {
    cargarAgendaSemanal();
  }, []);

  const cargarAgendaSemanal = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/citas/mis-tareas`, {
        credentials: 'include',
      });

      if (res.status === 401) {
        window.location.href = '/iniciar-sesion';
        return;
      }

      if (!res.ok) throw new Error('Error al cargar la agenda');
      const data = await res.json();
      setCitas(data);
    } catch (error) {
      toast.error('Error al cargar las tareas asignadas');
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstadoCita = async (id: number, nuevoEstado: string) => {
    try {
      const res = await fetch(`${API_URL}/api/citas/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (res.status === 401) {
        window.location.href = '/iniciar-sesion';
        return;
      }

      if (!res.ok) throw new Error('Error al actualizar');

      toast.success(`Cita marcada como ${nuevoEstado.replace('_', ' ').toLowerCase()}`);
      await cargarAgendaSemanal(); 
    } catch (error) {
      toast.error('No se pudo actualizar el progreso de la cita');
    }
  };

  // --- NUEVA FUNCIÓN PARA GUARDAR OBSERVACIÓN ---
  const guardarObservacion = async () => {
    if (!citaSeleccionada) return;

    try {
      const res = await fetch(`${API_URL}/api/citas/${citaSeleccionada.idCita}/observaciones`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ observacion: textoObservacion }),
      });

      if (res.status === 401) return window.location.href = '/iniciar-sesion';
      if (!res.ok) throw new Error('Error al guardar observación');

      toast.success('Notas técnicas guardadas correctamente');
      setModalAbierto(false);
      await cargarAgendaSemanal(); 
    } catch (error) {
      toast.error('Ocurrió un error al guardar las observaciones');
    }
  };

  const abrirModal = (cita: Cita) => {
    setCitaSeleccionada(cita);
    setTextoObservacion(cita.observaciones || ''); // Carga lo que ya estaba escrito, si existe
    setModalAbierto(true);
  };

  const citasDeLaSemana = citas.filter((cita) => {
    const fechaCita = new Date(cita.fecha + 'T00:00:00');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const limiteSemana = new Date();
    limiteSemana.setDate(hoy.getDate() + 7);
    limiteSemana.setHours(23, 59, 59, 999);
    return fechaCita >= hoy && fechaCita <= limiteSemana;
  }).sort((a, b) => new Date(`${a.fecha}T${a.hora}`).getTime() - new Date(`${b.fecha}T${b.hora}`).getTime());

  const getEstadoConfig = (estado: string) => {
    switch (estado?.toUpperCase()) {
      case 'PENDIENTE':
        return { icon: AlertCircle, colorClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400', label: 'Pendiente' };
      case 'EN_PROGRESO':
        return { icon: PlayCircle, colorClass: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400', label: 'En Progreso' };
      case 'COMPLETADA':
        return { icon: CheckCircle, colorClass: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400', label: 'Atendido' };
      case 'CANCELADA':
        return { icon: XCircle, colorClass: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400', label: 'Cancelada' };
      default:
        return { icon: AlertCircle, colorClass: 'bg-muted text-muted-foreground', label: estado };
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-foreground">Mi Agenda Semanal</h2>
        <p className="text-muted-foreground">Servicios asignados para los próximos 7 días</p>
      </div>

      {loading ? (
        <div className="text-center p-8 text-muted-foreground">Cargando tu cronograma laboral...</div>
      ) : citasDeLaSemana.length === 0 ? (
        <div className="text-center p-12 bg-card border border-border rounded-xl">
          <Calendar size={40} className="mx-auto mb-3 opacity-20 text-muted-foreground" />
          <p className="text-muted-foreground">No tienes tareas programadas para esta semana.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {citasDeLaSemana.map((cita, index) => {
            const config = getEstadoConfig(cita.estado);
            const StatusIcon = config.icon;
            const estadoUpper = cita.estado?.toUpperCase();

            return (
              <motion.div
                key={cita.idCita}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card hover>
                  <CardContent className="p-5 flex flex-col h-full">
                    {/* ENCABEZADO DE TARJETA */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="mb-1 text-card-foreground font-bold">{cita.servicio?.nombreServicio}</h4>
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1 font-medium">
                            <Calendar size={13} />
                            {new Date(cita.fecha + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </span>
                          <span className="flex items-center gap-1 font-medium">
                            <Clock size={13} />
                            {cita.hora.substring(0, 5)} hs
                          </span>
                        </div>
                      </div>
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.colorClass}`}>
                        <StatusIcon size={14} />
                        {config.label}
                      </span>
                    </div>

                    {/* DATOS DEL CLIENTE Y OBSERVACIONES */}
                    <div className="flex-1 space-y-3">
                      <div className="space-y-2 p-3 bg-muted rounded-lg border border-border text-sm">
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          <User size={15} className="text-accent" />
                          <span>Cliente: {cita.cliente?.nombre} {cita.cliente?.apellido}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground pt-1">
                          <div className="flex items-center gap-2">
                            <Phone size={13} className="text-accent" />
                            <span>{cita.cliente?.telefono}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail size={13} className="text-accent" />
                            <span className="line-clamp-1">{cita.cliente?.email}</span>
                          </div>
                        </div>
                        {cita.cliente?.placaMototaxi && (
                          <div className="mt-2 pt-2 border-t border-border/60 text-xs flex justify-between">
                            <span className="text-muted-foreground">Vehículo asignado:</span>
                            <span className="font-mono bg-background px-1.5 py-0.5 rounded border border-border text-foreground font-bold">
                              Placa: {cita.cliente.placaMototaxi}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* --- SECCIÓN VISUAL DE OBSERVACIONES --- */}
                      <div className="flex items-start justify-between bg-primary/5 border border-primary/20 rounded-lg p-3">
                        <div className="flex gap-2 text-sm w-full">
                          <FileText size={16} className="text-primary shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <span className="block font-medium text-primary mb-1">Notas técnicas:</span>
                            {cita.observaciones ? (
                               <p className="text-muted-foreground text-xs italic break-words">{cita.observaciones}</p>
                            ) : (
                               <p className="text-muted-foreground/60 text-xs italic">Añade repuestos usados o sugerencias...</p>
                            )}
                          </div>
                          {/* Botón rápido para abrir notas */}
                          <button onClick={() => abrirModal(cita)} className="text-primary hover:text-accent p-1 transition-colors shrink-0" title="Editar observaciones">
                            <Edit3 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* BOTONES DE ACCIÓN */}
                    <div className="mt-4 pt-4 border-t border-border flex gap-2">
                      {estadoUpper === 'PENDIENTE' && (
                        <Button variant="accent" size="sm" className="flex-1 font-semibold" onClick={() => cambiarEstadoCita(cita.idCita, 'EN_PROGRESO')}>
                          Atender Cita
                        </Button>
                      )}
                      
                      {estadoUpper === 'EN_PROGRESO' && (
                        <Button variant="secondary" size="sm" className="flex-1 font-semibold bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700" onClick={() => cambiarEstadoCita(cita.idCita, 'COMPLETADA')}>
                          <CheckCircle size={15} className="mr-2" />
                          Terminar Servicio
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* --- MODAL PARA ESCRIBIR OBSERVACIONES --- */}
      <Dialog.Root open={modalAbierto} onOpenChange={setModalAbierto}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl z-50">
            <Dialog.Title className="mb-2 text-card-foreground text-lg font-bold flex items-center gap-2">
              <FileText size={20} className="text-accent" />
              Observaciones del Servicio
            </Dialog.Title>
            <p className="text-sm text-muted-foreground mb-6">
              Registra detalles importantes para el cliente (ej. diagnóstico, recomendaciones futuras).
            </p>

            <textarea
              value={textoObservacion}
              onChange={(e) => setTextoObservacion(e.target.value)}
              placeholder="Escribe aquí las notas técnicas..."
              rows={5}
              className="w-full px-4 py-3 bg-input-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />

            <div className="flex gap-3 mt-6">
              <Button variant="ghost" className="flex-1" onClick={() => setModalAbierto(false)}>Cancelar</Button>
              <Button variant="accent" className="flex-1" onClick={guardarObservacion}>Guardar Notas</Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  );
};