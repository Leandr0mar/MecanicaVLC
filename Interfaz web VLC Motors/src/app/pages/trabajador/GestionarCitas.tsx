import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { User, Phone, Mail, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

const citasPendientes = [
  {
    id: 1,
    cliente: 'Juan Pérez',
    servicio: 'Mantenimiento General',
    fecha: '2026-05-10',
    hora: '10:00 AM',
    telefono: '+51 987 654 321',
    email: 'juan@example.com',
    estado: 'pendiente',
  },
  {
    id: 2,
    cliente: 'María González',
    servicio: 'Revisión de Frenos',
    fecha: '2026-05-12',
    hora: '03:00 PM',
    telefono: '+51 912 345 678',
    email: 'maria@example.com',
    estado: 'pendiente',
  },
  {
    id: 3,
    cliente: 'Pedro Sánchez',
    servicio: 'Cambio de Aceite',
    fecha: '2026-05-08',
    hora: '11:00 AM',
    telefono: '+51 998 765 432',
    email: 'pedro@example.com',
    estado: 'atendido',
  },
];

export const GestionarCitas = () => {
  const [citas, setCitas] = useState(citasPendientes);

  const cambiarEstado = (id: number, nuevoEstado: string) => {
    setCitas(citas.map((cita) =>
      cita.id === id ? { ...cita, estado: nuevoEstado } : cita
    ));
    toast.success(`Cita marcada como ${nuevoEstado}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-foreground">Gestionar Citas</h2>
        <p className="text-muted-foreground">Administra el estado de las citas asignadas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {citas.map((cita, index) => (
          <motion.div
            key={cita.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
          <Card hover>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="mb-1 text-card-foreground">{cita.servicio}</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(cita.fecha).toLocaleDateString('es-ES')} - {cita.hora}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  cita.estado === 'atendido'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {cita.estado === 'atendido' ? 'Atendido' : 'Pendiente'}
                </span>
              </div>

              <div className="space-y-2 mb-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <User size={16} className="text-accent" />
                  <span className="text-foreground">{cita.cliente}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={16} className="text-accent" />
                  <span className="text-foreground">{cita.telefono}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail size={16} className="text-accent" />
                  <span className="text-foreground">{cita.email}</span>
                </div>
              </div>

              {cita.estado === 'pendiente' && (
                <Button
                  variant="accent"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => cambiarEstado(cita.id, 'atendido')}
                >
                  <CheckCircle size={16} />
                  Marcar como Atendido
                </Button>
              )}
            </CardContent>
          </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
