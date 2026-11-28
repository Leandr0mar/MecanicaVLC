import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Star, User, MessageSquareOff, Mail, Phone, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { API_URL } from '../../context/AuthContext';

interface ReseñaTrabajador {
  idReseña: number;
  calificacion: number;
  comentario: string;
  fechaReseña: string;
  cita: {
    idCita: number;
    fecha: string;
    cliente: { nombre: string; apellido: string; email: string; telefono: string };
    servicio: { nombreServicio: string };
  };
}

const TAMANO_PAGINA = 10;

export const ReseñasTrabajador = () => {
  const [reseñas, setReseñas] = useState<ReseñaTrabajador[]>([]);
  const [loading, setLoading] = useState(true);
  const [promedioCalificacion, setPromedioCalificacion] = useState('0.0');
  const [totalReseñas, setTotalReseñas] = useState(0);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);

  useEffect(() => {
    cargarMisReseñas(pagina);
  }, [pagina]);

  const cargarMisReseñas = async (paginaSolicitada: number) => {
    try {
      if (!reseñas.length) setLoading(true);
      const parametros = new URLSearchParams({ pagina: String(paginaSolicitada), tamano: String(TAMANO_PAGINA) });
      const res = await fetch(`${API_URL}/api/reseñas/mis-reseñas?${parametros}`, { credentials: 'include' });
      
      if (res.status === 401) return (window.location.href = '/iniciar-sesion');
      if (!res.ok) throw new Error('Error al cargar las reseñas');

      const data = await res.json();
      if (paginaSolicitada > 0 && paginaSolicitada >= (data.totalPaginas ?? 0)) {
        setPagina(Math.max(0, (data.totalPaginas ?? 0) - 1));
        return;
      }
      setReseñas(data.contenido ?? []);
      setTotalReseñas(data.totalElementos ?? 0);
      setTotalPaginas(data.totalPaginas ?? 0);
      setPromedioCalificacion(Number(data.promedioCalificacion ?? 0).toFixed(1));
    } catch (error) {
      toast.error('No se pudieron cargar tus calificaciones');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-foreground">Mis Calificaciones</h2>
        <p className="text-muted-foreground">Comentarios y puntuaciones de los servicios que has atendido</p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Cargando tu historial de reseñas...</div>
      ) : totalReseñas === 0 ? (
        <div className="p-12 text-center bg-card rounded-xl border border-border text-muted-foreground">
          <MessageSquareOff size={48} className="mx-auto mb-4 opacity-20 text-accent" />
          <p className="font-medium">Aún no tienes reseñas.</p>
          <p className="text-sm mt-1">Sigue completando servicios para recibir feedback de tus clientes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          
          {/* Tarjeta de Estadísticas Generales */}
          <Card className="h-fit border-accent/20 lg:sticky lg:top-6">
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Promedio Global</h3>
              <div className="text-5xl font-black text-accent mb-3">{promedioCalificacion}</div>
              <div className="flex justify-center mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={20}
                    className={star <= Math.round(Number(promedioCalificacion)) ? 'fill-accent text-accent' : 'text-muted-foreground opacity-20'}
                  />
                ))}
              </div>
              <p className="text-sm font-medium text-foreground bg-muted py-1.5 px-3 rounded-full inline-block">
                Basado en {totalReseñas} {totalReseñas === 1 ? 'reseña' : 'reseñas'}
              </p>
            </CardContent>
          </Card>

          {/* Lista de Reseñas Individuales */}
          <div className="lg:col-span-3 space-y-4">
            {reseñas.map((reseña, index) => (
              <motion.div
                key={reseña.idReseña}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: Math.min(index * 0.025, 0.15) }}
              >
                <Card hover>
                  <CardContent className="p-5">
                    <div className="mb-3 flex flex-col items-start justify-between gap-3 sm:flex-row">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                          <User size={20} className="text-accent" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-foreground">
                            {reseña.cita?.cliente?.nombre || 'Cliente'} {reseña.cita?.cliente?.apellido || ''}
                          </h4>
                          <p className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded inline-block mt-1">
                            Servicio: {reseña.cita?.servicio?.nombreServicio}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            {reseña.cita?.cliente?.email && (
                              <span className="inline-flex items-center gap-1.5">
                                <Mail size={13} /> <span className="break-all">{reseña.cita.cliente.email}</span>
                              </span>
                            )}
                            {reseña.cita?.cliente?.telefono && (
                              <span className="inline-flex items-center gap-1.5">
                                <Phone size={13} /> {reseña.cita.cliente.telefono}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 text-left sm:text-right">
                        <div className="mb-1 flex justify-start gap-0.5 sm:justify-end">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={14}
                              className={star <= reseña.calificacion ? 'fill-accent text-accent' : 'text-muted-foreground opacity-20'}
                            />
                          ))}
                        </div>
                        <p className="text-xs font-medium text-muted-foreground">
                          {new Date(reseña.fechaReseña).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        {reseña.cita?.fecha && (
                          <p className="mt-1 inline-flex items-center justify-end gap-1 text-xs text-muted-foreground">
                            <CalendarDays size={12} /> Cita: {new Date(`${reseña.cita.fecha}T00:00:00`).toLocaleDateString('es-ES')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-background border border-border/50 rounded-lg">
                      <p className="text-sm text-foreground italic">"{reseña.comentario}"</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          {totalPaginas > 1 && (
            <div className="flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
              <span>Mostrando {pagina * TAMANO_PAGINA + 1}–{Math.min((pagina + 1) * TAMANO_PAGINA, totalReseñas)} de {totalReseñas} reseñas</span>
              <div className="flex items-center gap-2">
                <button type="button" className="min-h-10 rounded-md border border-border px-3 hover:bg-muted disabled:opacity-50" disabled={pagina === 0 || loading} onClick={() => setPagina(actual => Math.max(0, actual - 1))}>Anterior</button>
                <span>Página {pagina + 1} de {totalPaginas}</span>
                <button type="button" className="min-h-10 rounded-md border border-border px-3 hover:bg-muted disabled:opacity-50" disabled={pagina + 1 >= totalPaginas || loading} onClick={() => setPagina(actual => actual + 1)}>Siguiente</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
