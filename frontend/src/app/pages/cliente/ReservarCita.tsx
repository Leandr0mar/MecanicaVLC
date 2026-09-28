import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/button';
import { Calendar, Clock, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '../../utils/currency';
import { motion } from 'motion/react';
import { API_URL } from '../../context/AuthContext';

interface Servicio {
  idServicio: number;
  nombreServicio: string;
  duracionEstimadaMinutos: number;
  precioInicial: number;
}

export const ReservarCita = () => {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<number | null>(null);
  
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);

  useEffect(() => {
    cargarServicios();
  }, []);

  const cargarServicios = async () => {
    try {
      const res = await fetch(`${API_URL}/api/servicios`, { credentials: 'include' });
      if (res.status === 401) return window.location.href = '/iniciar-sesion';
      if (res.ok) setServicios(await res.json());
    } catch (error) {
      toast.error('Error al cargar los servicios');
    }
  };

  // Se dispara automáticamente cada vez que el usuario cambia la fecha en el calendario
  useEffect(() => {
    if (fecha) {
      cargarDisponibilidad(fecha);
      setHora(''); // Reiniciar la hora elegida al cambiar de día
    } else {
      setHorariosDisponibles([]);
    }
  }, [fecha]);

  const cargarDisponibilidad = async (fechaSeleccionada: string) => {
    try {
      setLoadingHorarios(true);
      const res = await fetch(`${API_URL}/api/citas/disponibilidad?fecha=${fechaSeleccionada}`, {
        credentials: 'include'
      });
      if (res.status === 401) return window.location.href = '/iniciar-sesion';
      if (res.ok) {
        setHorariosDisponibles(await res.json());
      }
    } catch (error) {
      toast.error('Error al verificar la disponibilidad');
    } finally {
      setLoadingHorarios(false);
    }
  };

  const handleConfirmar = async () => {
    if (!servicioSeleccionado || !fecha || !hora) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      const payload = {
        fecha: fecha,
        hora: `${hora}:00`, // Spring Boot requiere el formato de tiempo exacto
        servicio: { idServicio: servicioSeleccionado }
        // ¡No enviamos el montoInicial! Spring Boot lo calcula solo en el backend por seguridad
      };

      const res = await fetch(`${API_URL}/api/citas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (res.status === 401) return window.location.href = '/iniciar-sesion';
      
      if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || 'Error al reservar la cita');
      }

      toast.success('¡Cita reservada exitosamente!');
      setServicioSeleccionado(null);
      setFecha('');
      setHora('');
      setHorariosDisponibles([]);

    } catch (error: any) {
      toast.error(error.message || 'No se pudo completar la reserva');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-foreground">Reservar Cita</h2>
        <p className="text-muted-foreground">Selecciona un servicio y un horario disponible</p>
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
                    key={servicio.idServicio}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                  <div
                    onClick={() => setServicioSeleccionado(servicio.idServicio)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      servicioSeleccionado === servicio.idServicio
                        ? 'border-accent bg-accent/10 shadow-md'
                        : 'border-border hover:border-accent/50'
                    }`}
                  >
                    <h4 className="mb-2 text-card-foreground">{servicio.nombreServicio}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {servicio.duracionEstimadaMinutos} min
                      </span>
                      <span className="text-accent font-semibold">{formatCurrency(servicio.precioInicial)}</span>
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
                  min={new Date().toISOString().split('T')[0]} // No permite elegir fechas del pasado
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-foreground">Hora Disponible</label>
                <select
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  disabled={!fecha || loadingHorarios || horariosDisponibles.length === 0}
                  className="w-full px-4 py-2.5 bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                >
                  <option value="">
                    {!fecha ? 'Primero selecciona una fecha' 
                      : loadingHorarios ? 'Buscando disponibilidad...' 
                      : horariosDisponibles.length === 0 ? 'Sin disponibilidad para este día' 
                      : 'Seleccione una hora'}
                  </option>
                  {horariosDisponibles.map((h) => (
                    <option key={h} value={h}>{h} hs</option>
                  ))}
                </select>
              </div>

              {servicioSeleccionado && (
                <div className="p-4 bg-muted rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Servicio a solicitar:</p>
                  <p className="font-medium text-foreground">
                    {servicios.find((s) => s.idServicio === servicioSeleccionado)?.nombreServicio}
                  </p>
                  <p className="text-accent font-bold mt-2 text-lg">
                    {formatCurrency(servicios.find((s) => s.idServicio === servicioSeleccionado)?.precioInicial || 0)}
                  </p>
                </div>
              )}

              <Button variant="accent" className="w-full mt-4" onClick={handleConfirmar}>
                Confirmar Reserva
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};