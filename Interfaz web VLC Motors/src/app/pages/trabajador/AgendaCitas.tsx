import { Card, CardContent } from '../../components/ui/Card';
import { Calendar, Clock, User } from 'lucide-react';

const citasHoy = [
  { id: 1, cliente: 'Juan Pérez', servicio: 'Mantenimiento General', hora: '10:00 AM', duracion: '1 hora' },
  { id: 2, cliente: 'Ana Martínez', servicio: 'Cambio de Aceite', hora: '02:00 PM', duracion: '30 min' },
  { id: 3, cliente: 'Luis Torres', servicio: 'Afinamiento Completo', hora: '04:00 PM', duracion: '2 horas' },
];

const citasSemana = [
  { fecha: '2026-05-07', cantidad: 4 },
  { fecha: '2026-05-08', cantidad: 3 },
  { fecha: '2026-05-09', cantidad: 5 },
  { fecha: '2026-05-10', cantidad: 2 },
];

export const AgendaCitas = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-foreground">Agenda de Citas</h2>
        <p className="text-muted-foreground">Tus citas programadas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-4 text-card-foreground flex items-center gap-2">
                <Calendar className="text-accent" size={20} />
                Citas de Hoy - {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>

              <div className="space-y-3">
                {citasHoy.map((cita) => (
                  <div key={cita.id} className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-foreground flex items-center gap-2">
                          <User size={16} className="text-accent" />
                          {cita.cliente}
                        </h4>
                        <p className="text-sm text-muted-foreground">{cita.servicio}</p>
                      </div>
                      <span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm font-medium">
                        {cita.hora}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock size={14} />
                      Duración estimada: {cita.duracion}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-4 text-card-foreground">Vista Semanal</h3>
              <div className="space-y-3">
                {citasSemana.map((dia) => (
                  <div key={dia.fecha} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {new Date(dia.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                      {dia.cantidad} citas
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardContent className="p-5">
              <h3 className="mb-4 text-card-foreground">Estadísticas</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Hoy</span>
                  <span className="font-bold text-accent">{citasHoy.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Esta semana</span>
                  <span className="font-bold text-accent">14</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Este mes</span>
                  <span className="font-bold text-accent">56</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
