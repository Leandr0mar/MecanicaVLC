import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/button';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

const serviciosPendientes = [
  { id: 1, nombre: 'Cambio de Aceite', fecha: '2026-05-03', trabajador: 'María García' },
  { id: 2, nombre: 'Revisión de Frenos', fecha: '2026-04-28', trabajador: 'Pedro Ramírez' },
];

export const Reseñas = () => {
  const [calificaciones, setCalificaciones] = useState<{ [key: number]: number }>({});
  const [comentarios, setComentarios] = useState<{ [key: number]: string }>({});

  const handleCalificar = (servicioId: number, puntos: number) => {
    setCalificaciones({ ...calificaciones, [servicioId]: puntos });
  };

  const handleEnviar = (servicioId: number) => {
    if (!calificaciones[servicioId]) {
      toast.error('Por favor selecciona una calificación');
      return;
    }
    toast.success('Reseña enviada exitosamente');
    setCalificaciones({ ...calificaciones, [servicioId]: 0 });
    setComentarios({ ...comentarios, [servicioId]: '' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-foreground">Reseñas</h2>
        <p className="text-muted-foreground">Califica los servicios que has recibido</p>
      </div>

      <div className="space-y-4">
        {serviciosPendientes.map((servicio) => {
          const rating = calificaciones[servicio.id] || 0;

          return (
            <Card key={servicio.id}>
              <CardHeader>
                <CardTitle>{servicio.nombre}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {new Date(servicio.fecha).toLocaleDateString('es-ES')} - {servicio.trabajador}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm mb-2 text-foreground">Calificación</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleCalificar(servicio.id, star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          size={32}
                          className={star <= rating ? 'fill-accent text-accent' : 'text-muted'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-foreground">Comentarios (opcional)</label>
                  <textarea
                    value={comentarios[servicio.id] || ''}
                    onChange={(e) => setComentarios({ ...comentarios, [servicio.id]: e.target.value })}
                    placeholder="Cuéntanos tu experiencia..."
                    rows={4}
                    className="w-full px-4 py-2.5 bg-input-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>

                <Button
                  variant="accent"
                  className="w-full"
                  onClick={() => handleEnviar(servicio.id)}
                >
                  Enviar Reseña
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
