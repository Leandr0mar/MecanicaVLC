import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/button';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

const citas = [
  {
    id: 1,
    servicio: 'Mantenimiento General',
    fecha: '2026-05-10',
    hora: '10:00 AM',
    estado: 'pendiente',
    trabajador: 'Carlos López',
  },
  {
    id: 2,
    servicio: 'Cambio de Aceite',
    fecha: '2026-05-03',
    hora: '02:00 PM',
    estado: 'completada',
    trabajador: 'María García',
  },
  {
    id: 3,
    servicio: 'Revisión de Frenos',
    fecha: '2026-04-28',
    hora: '11:00 AM',
    estado: 'completada',
    trabajador: 'Pedro Ramírez',
  },
  {
    id: 4,
    servicio: 'Afinamiento Completo',
    fecha: '2026-05-15',
    hora: '09:00 AM',
    estado: 'pendiente',
    trabajador: 'Carlos López',
  },
];

const estadoConfig = {
  pendiente: {
    icon: AlertCircle,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    label: 'Pendiente',
  },
  completada: {
    icon: CheckCircle,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    label: 'Completada',
  },
  cancelada: {
    icon: XCircle,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    label: 'Cancelada',
  },
};

export const MisCitas = () => {
  const handleCancelar = (id: number) => {
    toast.success('Cita cancelada exitosamente');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-foreground">Mis Citas</h2>
        <p className="text-muted-foreground">Historial de tus citas programadas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {citas.map((cita, index) => {
          const config = estadoConfig[cita.estado as keyof typeof estadoConfig];
          const Icon = config.icon;

          return (
            <motion.div
              key={cita.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
            <Card hover>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="mb-1 text-card-foreground">{cita.servicio}</h4>
                    <p className="text-sm text-muted-foreground">Trabajador: {cita.trabajador}</p>
                  </div>
                  <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${config.bgColor} ${config.color}`}>
                    <Icon size={14} />
                    {config.label}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar size={16} />
                    <span>{new Date(cita.fecha).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock size={16} />
                    <span>{cita.hora}</span>
                  </div>
                </div>

                {cita.estado === 'pendiente' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => handleCancelar(cita.id)}
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
    </div>
  );
};
