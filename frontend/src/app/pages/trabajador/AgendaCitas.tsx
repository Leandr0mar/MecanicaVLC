import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Calendar, Clock, User, CheckCircle, AlertCircle, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { API_URL } from '../../context/AuthContext';

export const AgendaCitas = () => {
  const [citas, setCitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarAgendaGlobal();
  }, []);

  const cargarAgendaGlobal = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/citas/mis-tareas`, { credentials: 'include' });
      
      if (res.status === 401) return (window.location.href = '/iniciar-sesion');
      if (!res.ok) throw new Error('Error al cargar la agenda');

      const data = await res.json();
      setCitas(data);
    } catch (error) {
      toast.error('No se pudo cargar tu agenda de trabajo');
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE FECHAS Y ESTADÍSTICAS ---
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, '0');
  const dd = String(hoy.getDate()).padStart(2, '0');
  const fechaHoyStr = `${yyyy}-${mm}-${dd}`; // Formato YYYY-MM-DD para igualar a la BD

  // 1. Filtrar las citas estrictamente de HOY
  const citasHoy = citas
    .filter(c => c.fecha === fechaHoyStr)
    .sort((a, b) => a.hora.localeCompare(b.hora));

  // 2. Generar el resumen de los próximos 7 días
  const citasSemana = [];
  for (let i = 1; i <= 7; i++) {
    const fechaIteracion = new Date(hoy);
    fechaIteracion.setDate(fechaIteracion.getDate() + i);
    
    const iterY = fechaIteracion.getFullYear();
    const iterM = String(fechaIteracion.getMonth() + 1).padStart(2, '0');
    const iterD = String(fechaIteracion.getDate()).padStart(2, '0');
    const fechaStr = `${iterY}-${iterM}-${iterD}`;

    const cantidadCitas = citas.filter(c => c.fecha === fechaStr).length;
    citasSemana.push({ fecha: fechaStr, cantidad: cantidadCitas });
  }

  // 3. Calcular Estadísticas
  const totalHoy = citasHoy.length;
  
  const totalSemana = citas.filter(c => {
    const cDate = new Date(c.fecha + 'T00:00:00');
    const limit = new Date(hoy);
    limit.setDate(limit.getDate() + 7);
    limit.setHours(23, 59, 59, 999);
    const inicio = new Date(fechaHoyStr + 'T00:00:00');
    return cDate >= inicio && cDate <= limit;
  }).length;

  const totalMes = citas.filter(c => c.fecha.startsWith(`${yyyy}-${mm}`)).length;

  // Renderizado visual de estado
  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'COMPLETADA': return <CheckCircle size={14} className="text-green-500" />;
      case 'EN_PROGRESO': return <PlayCircle size={14} className="text-blue-500" />;
      default: return <AlertCircle size={14} className="text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-foreground">Resumen General</h2>
        <p className="text-muted-foreground">Tu cronograma y carga laboral actual</p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Calculando estadísticas de tu agenda...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* PANEL IZQUIERDO: CITAS DE HOY */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardContent className="p-5">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-card-foreground flex items-center gap-2 font-bold">
                    <Calendar className="text-accent" size={20} />
                    Citas para Hoy
                  </h3>
                  <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </span>
                </div>

                {citasHoy.length === 0 ? (
                  <div className="text-center p-8 bg-muted/50 rounded-lg border border-dashed border-border text-muted-foreground">
                    <CheckCircle size={32} className="mx-auto mb-2 opacity-30 text-green-500" />
                    <p>No tienes citas programadas para el día de hoy.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {citasHoy.map((cita, index) => (
                      <motion.div 
                        key={cita.idCita} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="p-4 bg-muted border border-border/50 rounded-lg hover:bg-muted/80 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-bold text-foreground flex items-center gap-2">
                              <User size={16} className="text-accent" />
                              {cita.cliente?.nombre} {cita.cliente?.apellido}
                            </h4>
                            <p className="text-sm font-medium text-muted-foreground mt-1">
                              Servicio: {cita.servicio?.nombreServicio}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm font-bold">
                              {cita.hora.substring(0, 5)} hs
                            </span>
                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              {getEstadoIcon(cita.estado)} {cita.estado.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mt-3 pt-3 border-t border-border/60">
                          <Clock size={14} className="text-muted-foreground" />
                          Duración estimada: 1 hora aprox.
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* PANEL DERECHO: PRÓXIMOS DÍAS Y MÉTRICAS */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-5">
                <h3 className="mb-4 text-card-foreground font-bold">Próximos 7 Días</h3>
                <div className="space-y-2">
                  {citasSemana.map((dia) => (
                    <div key={dia.fecha} className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border/50">
                      <div>
                        <p className="font-medium text-foreground text-sm capitalize">
                          {new Date(dia.fecha + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        dia.cantidad > 0 ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground border border-border'
                      }`}>
                        {dia.cantidad} {dia.cantidad === 1 ? 'cita' : 'citas'}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <h3 className="mb-4 text-card-foreground font-bold">Mis Métricas</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">Agendadas Hoy</span>
                    <span className="font-black text-lg text-accent">{totalHoy}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">Esta Semana</span>
                    <span className="font-black text-lg text-accent">{totalSemana}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">Total del Mes</span>
                    <span className="font-black text-lg text-accent">{totalMes}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      )}
    </div>
  );
};