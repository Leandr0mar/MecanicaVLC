import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { ArrowUp, ArrowDown, Package, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { API_URL } from '../../context/AuthContext';

interface Historial {
  idHistorialStock: number;
  cantidad: number;
  tipoMovimiento: string;
  fechaMovimiento: string;
  descripcion: string;
  producto: {
    nombre: string;
  };
}

export const HistorialStock = () => {
  const [movimientos, setMovimientos] = useState<Historial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/historial-stock`, { credentials: 'include' });
      if (res.status === 401) return (window.location.href = '/iniciar-sesion');
      if (!res.ok) throw new Error('Error al cargar');
      
      const data = await res.json();
      setMovimientos(data);
    } catch (error) {
      toast.error('Error al cargar el historial de stock');
    } finally {
      setLoading(false);
    }
  };

  // --- CÁLCULOS MATEMÁTICOS PARA LAS TARJETAS ESTADÍSTICAS ---
  const movimientosEsteMes = movimientos.filter(m => {
    const fecha = new Date(m.fechaMovimiento);
    const hoy = new Date();
    return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();
  }).length;

  const entradasTotales = movimientos
    .filter(m => m.tipoMovimiento.toUpperCase().includes('ENTRADA'))
    .reduce((sum, m) => sum + m.cantidad, 0);

  const salidasTotales = movimientos
    .filter(m => m.tipoMovimiento.toUpperCase().includes('SALIDA'))
    .reduce((sum, m) => sum + m.cantidad, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-foreground">Historial de Stock</h2>
        <p className="text-muted-foreground">Registro de movimientos de inventario en tiempo real</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card hover>
            <CardContent className="p-5 text-center">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mx-auto mb-3">
                <Activity size={24} className="text-accent" />
              </div>
              <h3 className="text-accent mb-1">{movimientosEsteMes}</h3>
              <p className="text-sm text-muted-foreground">Movimientos este mes</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          <Card hover>
            <CardContent className="p-5 text-center">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                <ArrowUp size={24} className="text-green-500 dark:text-green-400" />
              </div>
              <h3 className="text-green-600 dark:text-green-400 mb-1">{entradasTotales}</h3>
              <p className="text-sm text-muted-foreground">Entradas (Unidades)</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
          <Card hover>
            <CardContent className="p-5 text-center">
              <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center mx-auto mb-3">
                <ArrowDown size={24} className="text-red-500 dark:text-red-400" />
              </div>
              <h3 className="text-red-600 dark:text-red-400 mb-1">{salidasTotales}</h3>
              <p className="text-sm text-muted-foreground">Salidas (Unidades)</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movimientos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="text-center py-8 text-muted-foreground">Cargando movimientos...</div>
          ) : movimientos.length === 0 ? (
             <div className="text-center py-8 text-muted-foreground">Aún no hay movimientos de stock registrados.</div>
          ) : (
            <div className="space-y-3">
              {movimientos.map((movimiento) => {
                const esEntrada = movimiento.tipoMovimiento.toUpperCase().includes('ENTRADA');
                
                return (
                  <div key={movimiento.idHistorialStock} className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          esEntrada ? 'bg-green-500/20' : 'bg-red-500/20'
                        }`}>
                          {esEntrada ? (
                            <ArrowUp size={20} className="text-green-600 dark:text-green-400" />
                          ) : (
                            <ArrowDown size={20} className="text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground mb-1">
                            {movimiento.producto?.nombre || 'Producto no disponible'}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="px-2 py-0.5 rounded bg-background border border-border text-[10px] uppercase font-bold tracking-wider">
                              {movimiento.tipoMovimiento.replace('_', ' ')}
                            </span>
                            <span>•</span>
                            <span>{new Date(movimiento.fechaMovimiento).toLocaleString('es-ES')}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 font-medium">{movimiento.descripcion}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`font-semibold text-lg ${
                          esEntrada ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {esEntrada ? '+' : '-'}{movimiento.cantidad}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">
                          {esEntrada ? 'Unidades' : 'Unidades'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};