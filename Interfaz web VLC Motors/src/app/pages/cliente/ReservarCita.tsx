import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/button';
import { Calendar, Clock, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '../../utils/currency';
import { motion } from 'motion/react';

const servicios = [
  { id: 1, nombre: 'Mantenimiento General', duracion: '1 hora', precio: 50 },
  { id: 2, nombre: 'Cambio de Aceite', duracion: '30 min', precio: 30 },
  { id: 3, nombre: 'Revisión de Frenos', duracion: '45 min', precio: 40 },
  { id: 4, nombre: 'Afinamiento Completo', duracion: '2 horas', precio: 100 },
  { id: 5, nombre: 'Cambio de Llantas', duracion: '1 hora', precio: 80 },
];

export const ReservarCita = () => {
  const [servicioSeleccionado, setServicioSeleccionado] = useState<number | null>(null);
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');

  const handleConfirmar = () => {
    if (!servicioSeleccionado || !fecha || !hora) {
      toast.error('Por favor completa todos los campos');
      return;
    }
    toast.success('Cita reservada exitosamente');
    setServicioSeleccionado(null);
    setFecha('');
    setHora('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-foreground">Reservar Cita</h2>
        <p className="text-muted-foreground">Selecciona un servicio y agenda tu cita</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench size={20} className="text-accent" />
                Selecciona un Servicio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {servicios.map((servicio, index) => (
                  <motion.div
                    key={servicio.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                  <div
                    onClick={() => setServicioSeleccionado(servicio.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      servicioSeleccionado === servicio.id
                        ? 'border-accent bg-accent/10 shadow-md'
                        : 'border-border hover:border-accent/50'
                    }`}
                  >
                    <h4 className="mb-2 text-card-foreground">{servicio.nombre}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {servicio.duracion}
                      </span>
                      <span className="text-accent font-semibold">{formatCurrency(servicio.precio)}</span>
                    </div>
                  </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar size={20} className="text-accent" />
                Fecha y Hora
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-foreground">Fecha</label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full px-4 py-2.5 bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-foreground">Hora</label>
                <select
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  className="w-full px-4 py-2.5 bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Selecciona una hora</option>
                  <option value="08:00">08:00 AM</option>
                  <option value="09:00">09:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="15:00">03:00 PM</option>
                  <option value="16:00">04:00 PM</option>
                  <option value="17:00">05:00 PM</option>
                </select>
              </div>

              {servicioSeleccionado && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Servicio seleccionado:</p>
                  <p className="font-medium text-foreground">
                    {servicios.find((s) => s.id === servicioSeleccionado)?.nombre}
                  </p>
                  <p className="text-accent font-semibold mt-2">
                    {formatCurrency(servicios.find((s) => s.id === servicioSeleccionado)?.precio || 0)}
                  </p>
                </div>
              )}

              <Button variant="accent" className="w-full" onClick={handleConfirmar}>
                Confirmar Cita
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
