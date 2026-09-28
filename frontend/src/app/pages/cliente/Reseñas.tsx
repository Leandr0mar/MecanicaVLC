import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/button';
import { Star, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { API_URL } from '../../context/AuthContext';

export const Reseñas = () => {
  const [serviciosPendientes, setServiciosPendientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [calificaciones, setCalificaciones] = useState<{ [key: number]: number }>({});
  const [comentarios, setComentarios] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    cargarCitasParaEvaluar();
  }, []);

  const cargarCitasParaEvaluar = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/citas/mis-citas`, { credentials: 'include' });
      
      if (res.status === 401) return (window.location.href = '/iniciar-sesion');
      if (!res.ok) throw new Error('Error al cargar servicios');

      const data = await res.json();
      
      // Filtramos dinámicamente: Solo las completadas que no tengan objeto "reseña"
      const citasFiltradas = data.filter((cita: any) => 
        cita.estado === 'COMPLETADA' && !cita.reseña
      );
      
      setServiciosPendientes(citasFiltradas);
    } catch (error) {
      toast.error('No se pudieron cargar los servicios para calificar');
    } finally {
      setLoading(false);
    }
  };

  const handleCalificar = (citaId: number, puntos: number) => {
    setCalificaciones({ ...calificaciones, [citaId]: puntos });
  };

  const handleEnviar = async (citaId: number) => {
    const calificacion = calificaciones[citaId];
    const comentario = comentarios[citaId] || 'Sin comentarios adicionales.';

    if (!calificacion) {
      toast.error('Por favor selecciona una calificación de estrellas');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/reseñas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ idCita: citaId, calificacion, comentario }),
      });

      if (res.status === 401) return (window.location.href = '/iniciar-sesion');
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Error al guardar la reseña');
      }

      toast.success('¡Reseña enviada exitosamente! Gracias por tu opinión.');
      
      // Limpiamos los campos y recargamos para que desaparezca la tarjeta
      setCalificaciones({ ...calificaciones, [citaId]: 0 });
      setComentarios({ ...comentarios, [citaId]: '' });
      cargarCitasParaEvaluar();
      
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-foreground">Calificar Servicios</h2>
        <p className="text-muted-foreground">Tu opinión nos ayuda a mejorar constantemente</p>
      </div>

      {loading ? (
        <div className="text-center p-8 text-muted-foreground">Buscando servicios pendientes de evaluación...</div>
      ) : serviciosPendientes.length === 0 ? (
        <div className="text-center p-12 bg-card border border-border rounded-xl">
          <CheckCircle size={48} className="mx-auto mb-3 opacity-20 text-accent" />
          <p className="text-muted-foreground font-medium">¡Estás al día! No tienes servicios pendientes por calificar.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {serviciosPendientes.map((cita, index) => {
            const rating = calificaciones[cita.idCita] || 0;

            return (
              <motion.div
                key={cita.idCita}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-accent">{cita.servicio?.nombreServicio}</CardTitle>
                    <p className="text-sm text-muted-foreground font-medium mt-1">
                      Atendido el {new Date(cita.fecha + 'T00:00:00').toLocaleDateString('es-ES')} por <span className="text-foreground">{cita.trabajador?.nombre} {cita.trabajador?.apellido}</span>
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div>
                      <label className="block text-sm mb-2 text-foreground font-medium">Calificación General</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleCalificar(cita.idCita, star)}
                            className="transition-transform hover:scale-110 p-1"
                          >
                            <Star
                              size={32}
                              className={star <= rating ? 'fill-accent text-accent' : 'text-muted-foreground opacity-30'}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm mb-2 text-foreground font-medium">Comentarios y Sugerencias (opcional)</label>
                      <textarea
                        value={comentarios[cita.idCita] || ''}
                        onChange={(e) => setComentarios({ ...comentarios, [cita.idCita]: e.target.value })}
                        placeholder="Cuéntanos cómo te pareció la atención del mecánico y la calidad del servicio..."
                        rows={3}
                        className="w-full px-4 py-3 bg-input-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                      />
                    </div>

                    <Button
                      variant="accent"
                      className="w-full font-bold"
                      onClick={() => handleEnviar(cita.idCita)}
                    >
                      Enviar Calificación
                    </Button>
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