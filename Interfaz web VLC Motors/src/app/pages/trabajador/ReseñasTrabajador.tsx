import { Card, CardContent } from '../../components/ui/Card';
import { Star, User } from 'lucide-react';

const reseñas = [
  {
    id: 1,
    cliente: 'Juan Pérez',
    servicio: 'Mantenimiento General',
    calificacion: 5,
    comentario: 'Excelente servicio, muy profesional y rápido. Totalmente recomendado.',
    fecha: '2026-05-03',
  },
  {
    id: 2,
    cliente: 'María González',
    servicio: 'Cambio de Aceite',
    calificacion: 4,
    comentario: 'Buen trabajo, aunque tardó un poco más de lo esperado.',
    fecha: '2026-05-01',
  },
  {
    id: 3,
    cliente: 'Pedro Ramírez',
    servicio: 'Revisión de Frenos',
    calificacion: 5,
    comentario: 'Muy satisfecho con el trabajo realizado. Gracias!',
    fecha: '2026-04-28',
  },
  {
    id: 4,
    cliente: 'Ana Torres',
    servicio: 'Afinamiento Completo',
    calificacion: 5,
    comentario: 'Impecable! La moto quedó como nueva.',
    fecha: '2026-04-25',
  },
];

export const ReseñasTrabajador = () => {
  const promedioCalificacion = (
    reseñas.reduce((sum, r) => sum + r.calificacion, 0) / reseñas.length
  ).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-foreground">Reseñas Recibidas</h2>
        <p className="text-muted-foreground">Comentarios de tus clientes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 text-center">
            <div className="text-4xl font-bold text-accent mb-2">{promedioCalificacion}</div>
            <div className="flex justify-center mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={star <= Math.round(Number(promedioCalificacion)) ? 'fill-accent text-accent' : 'text-muted'}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{reseñas.length} reseñas</p>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-4">
          {reseñas.map((reseña) => (
            <Card key={reseña.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <User size={20} className="text-accent" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{reseña.cliente}</h4>
                      <p className="text-xs text-muted-foreground">{reseña.servicio}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex gap-0.5 mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          className={star <= reseña.calificacion ? 'fill-accent text-accent' : 'text-muted'}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(reseña.fecha).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-foreground">{reseña.comentario}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
