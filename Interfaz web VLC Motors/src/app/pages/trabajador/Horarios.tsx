import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Clock } from 'lucide-react';
import { toast } from 'sonner';

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const horarioInicial = {
  Lunes: { activo: true, inicio: '08:00', fin: '17:00' },
  Martes: { activo: true, inicio: '08:00', fin: '17:00' },
  Miércoles: { activo: true, inicio: '08:00', fin: '17:00' },
  Jueves: { activo: true, inicio: '08:00', fin: '17:00' },
  Viernes: { activo: true, inicio: '08:00', fin: '17:00' },
  Sábado: { activo: true, inicio: '08:00', fin: '13:00' },
};

export const Horarios = () => {
  const [horarios, setHorarios] = useState(horarioInicial);

  const toggleDia = (dia: string) => {
    setHorarios({
      ...horarios,
      [dia]: { ...horarios[dia as keyof typeof horarios], activo: !horarios[dia as keyof typeof horarios].activo },
    });
  };

  const actualizarHora = (dia: string, tipo: 'inicio' | 'fin', valor: string) => {
    setHorarios({
      ...horarios,
      [dia]: { ...horarios[dia as keyof typeof horarios], [tipo]: valor },
    });
  };

  const guardarCambios = () => {
    toast.success('Horarios actualizados exitosamente');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-foreground">Configurar Horarios</h2>
        <p className="text-muted-foreground">Gestiona tu disponibilidad semanal</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="text-accent" size={20} />
            Disponibilidad Semanal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {diasSemana.map((dia) => {
            const horario = horarios[dia as keyof typeof horarios];
            return (
              <div key={dia} className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={horario.activo}
                      onChange={() => toggleDia(dia)}
                      className="w-5 h-5 rounded accent-accent"
                    />
                    <span className="font-medium text-foreground">{dia}</span>
                  </label>
                </div>

                {horario.activo && (
                  <div className="grid grid-cols-2 gap-4 ml-8">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Inicio</label>
                      <input
                        type="time"
                        value={horario.inicio}
                        onChange={(e) => actualizarHora(dia, 'inicio', e.target.value)}
                        className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Fin</label>
                      <input
                        type="time"
                        value={horario.fin}
                        onChange={(e) => actualizarHora(dia, 'fin', e.target.value)}
                        className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <Button variant="accent" className="w-full" onClick={guardarCambios}>
            Guardar Cambios
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
