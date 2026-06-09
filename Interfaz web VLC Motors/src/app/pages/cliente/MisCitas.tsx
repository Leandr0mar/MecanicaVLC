import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/button';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { API_URL } from '../../context/AuthContext';

interface Cita {
  idCita: number;
  fecha: string;
  hora: string;
  estado: string; // "PENDIENTE", "EN_PROGRESO", "COMPLETADA", "CANCELADA"
  servicio: {
    nombreServicio: string;
  };
  trabajador?: {
    nombre: string;
    apellido: string;
  };
}

export const MisCitas = () => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarCitas();
  }, []);

  const cargarCitas = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/citas/mis-citas`, {
        credentials: 'include'
      });
      
      if (res.status === 401) {
        window.location.href = '/iniciar-sesion';
        return;
      }
      
      if (res.ok) {
        const data = await res.json();
        // Ordenar para que las más recientes salgan primero
        const ordenadas = data.sort((a: Cita, b: Cita) => 
          new Date(`${b.fecha}T${b.hora}`).getTime() - new Date(`${a.fecha}T${a.hora}`).getTime()
        );
        setCitas(ordenadas);
      }
    } catch (error) {
      toast.error('Error al cargar tu historial de citas');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async (id: number) => {
    // Pequeña confirmación antes de cancelar
    if (!window.confirm("¿Estás seguro de que deseas cancelar esta cita?")) return;

    try {
      const res = await fetch(`${API_URL}/api/citas/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ estado: 'CANCELADA' })
      });

      if (res.status === 401) {
        window.location.href = '/iniciar-sesion';
        return;
      }

      if (!res.ok) throw new Error('Error al cancelar');

      toast.success('Cita cancelada exitosamente');
      await cargarCitas(); // Recargar la lista para ver el cambio instantáneo
    } catch (error) {
      toast.error('No se pudo cancelar la cita');
    }
  };

  // Función para manejar los colores en modo Claro y Oscuro dinámicamente
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
          label: 'Completada',
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
        <h2 className="mb-2 text-foreground">Mis Citas</h2>
        <p className="text-muted-foreground">Historial de tus citas programadas</p>
      </div>

      {loading ? (
        <div className="text-center p-8 text-muted-foreground">Cargando tus citas...</div>
      ) : citas.length === 0 ? (
        <div className="text-center p-12 bg-card border border-border rounded-xl">
          <Calendar size={40} className="mx-auto mb-3 opacity-20" />
          <p className="text-muted-foreground">Aún no tienes ninguna cita programada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {citas.map((cita, index) => {
            const config = getEstadoConfig(cita.estado);
            const Icon = config.icon;

            return (
              <motion.div
                key={cita.idCita}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card hover>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="mb-1 text-card-foreground">
                          {cita.servicio?.nombreServicio || 'Servicio no especificado'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Mecánico:{' '}
                          {cita.trabajador 
                            ? `${cita.trabajador.nombre} ${cita.trabajador.apellido}`
                            : 'Por asignar'}
                        </p>
                      </div>
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.colorClass}`}>
                        <Icon size={14} />
                        {config.label}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar size={16} />
                        <span className="capitalize">
                          {new Date(cita.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock size={16} />
                        <span>{cita.hora.substring(0, 5)} hs</span>
                      </div>
                    </div>

                    {/* El botón solo aparece si el estado es PENDIENTE */}
                    {cita.estado === 'PENDIENTE' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => handleCancelar(cita.idCita)}
                      >
                        Cancelar Cita
                      </Button>
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