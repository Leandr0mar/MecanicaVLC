import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/button';
import { User, Phone, Mail, CheckCircle, Calendar, Clock, AlertCircle, PlayCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
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
      await cargarAgendaSemanal(); // Recargar datos para reflejar el cambio
    } catch (error) {
      toast.error('No se pudo actualizar el progreso de la cita');
    }
  };

  // --- FILTRO CRÍTICO: Rango de una semana (Próximos 7 días) ---
  const citasDeLaSemana = citas.filter((cita) => {
    const fechaCita = new Date(cita.fecha + 'T00:00:00');
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const limiteSemana = new Date();
    limiteSemana.setDate(hoy.getDate() + 7);
    limiteSemana.setHours(23, 59, 59, 999);

    // Retorna true si la cita está entre hoy y los próximos 7 días
    return fechaCita >= hoy && fechaCita <= limiteSemana;
  }).sort((a, b) => new Date(`${a.fecha}T${a.hora}`).getTime() - new Date(`${b.fecha}T${b.hora}`).getTime());

  // Configuración adaptativa de estados con soporte modo claro y oscuro
  const getEstadoConfig = (estado: string) => {
    switch (estado?.toUpperCase()) {
      case 'PENDIENTE':
        return {
          icon: AlertCircle,
          colorClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400',
          label: 'Pendiente',
        };
      case 'EN_PROGRESO':
        return {
          icon: PlayCircle,
          colorClass: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400',
          label: 'En Progreso',
        };
      case 'COMPLETADA':
        return {
          icon: CheckCircle,
          colorClass: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400',
          label: 'Atendido',
        };
      case 'CANCELADA':
        return {
          icon: XCircle,
          colorClass: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400',
          label: 'Cancelada',
        };
      default:
        return {
          icon: AlertCircle,
          colorClass: 'bg-muted text-muted-foreground',
          label: estado,
        };
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
            const estadoUpper = cita.estado?.toUpperCase(); // Almacenamos el estado en mayúsculas para las condiciones

            return (
              <motion.div
                key={cita.idCita}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card hover>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="mb-1 text-card-foreground font-bold">{cita.servicio?.nombreServicio}</h4>
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1 font-medium">
                            <Calendar size={13} />
                            {new Date(cita.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                            })}
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

                    <div className="space-y-2 mb-4 p-3 bg-muted rounded-lg border border-border text-sm">
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

                    {/* Botones de acción operativos dinámicos actualizados */}
                    <div className="mt-3">
                      {estadoUpper === 'PENDIENTE' && (
                        <Button
                          variant="accent"
                          size="sm"
                          className="w-full gap-2 font-semibold"
                          onClick={() => cambiarEstadoCita(cita.idCita, 'EN_PROGRESO')}
                        >
                          Atender Cita
                        </Button>
                      )}
                      
                      {estadoUpper === 'EN_PROGRESO' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full gap-2 font-semibold bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                          onClick={() => cambiarEstadoCita(cita.idCita, 'COMPLETADA')}
                        >
                          <CheckCircle size={15} />
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
    </div>
  );
};