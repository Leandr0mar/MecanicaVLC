import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Star, User, MessageSquareOff } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { API_URL } from '../../context/AuthContext';

export const ReseñasTrabajador = () => {
  const [reseñas, setReseñas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarMisReseñas();
  }, []);

  const cargarMisReseñas = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/reseñas/mis-reseñas`, { credentials: 'include' });
      
      if (res.status === 401) return (window.location.href = '/iniciar-sesion');
      if (!res.ok) throw new Error('Error al cargar las reseñas');

      const data = await res.json();
      
      // Ordenamos para que las reseñas más recientes aparezcan primero
      const ordenadas = data.sort((a: any, b: any) => 
        new Date(b.fechaReseña).getTime() - new Date(a.fechaReseña).getTime()
      );
      
      setReseñas(ordenadas);
    } catch (error) {
      toast.error('No se pudieron cargar tus calificaciones');
    } finally {
      setLoading(false);
    }
  };

  // Cálculo matemático del promedio asegurando que no haya división por cero
  const promedioCalificacion = reseñas.length > 0
    ? (reseñas.reduce((sum, r) => sum + r.calificacion, 0) / reseñas.length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-foreground">Mis Calificaciones</h2>
        <p className="text-muted-foreground">Comentarios y puntuaciones de los servicios que has atendido</p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Cargando tu historial de reseñas...</div>
      ) : reseñas.length === 0 ? (
        <div className="p-12 text-center bg-card rounded-xl border border-border text-muted-foreground">
          <MessageSquareOff size={48} className="mx-auto mb-4 opacity-20 text-accent" />
          <p className="font-medium">Aún no tienes reseñas.</p>
          <p className="text-sm mt-1">Sigue completando servicios para recibir feedback de tus clientes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          
          {/* Tarjeta de Estadísticas Generales */}
          <Card className="h-fit sticky top-6 border-accent/20">
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
                Basado en {reseñas.length} {reseñas.length === 1 ? 'reseña' : 'reseñas'}
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
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card hover>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                          <User size={20} className="text-accent" />
                        </div>
                        <div>
                          {/* Extraemos el nombre del cliente desde la Cita asociada */}
                          <h4 className="font-bold text-foreground">
                            {reseña.cita?.cliente?.nombre} {reseña.cita?.cliente?.apellido}
                          </h4>
                          {/* Extraemos el servicio desde la Cita asociada */}
                          <p className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded inline-block mt-1">
                            Servicio: {reseña.cita?.servicio?.nombreServicio}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex gap-0.5 mb-1 justify-end">
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
        </div>
      )}
    </div>
  );
};