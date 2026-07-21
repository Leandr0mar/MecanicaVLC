import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Wrench, Calendar, Star } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { API_URL } from '../../context/AuthContext';

const COLORS = ['#d4af37', '#3b82f6', '#10b981', '#f59e0b', '#6366f1'];
const STATUS_COLORS: { [key: string]: string } = {
  'PENDIENTE': '#f59e0b',
  'EN_PROGRESO': '#3b82f6',
  'COMPLETADA': '#10b981',
  'CANCELADA': '#ef4444'
};

export const Reportes = () => {
  const [loading, setLoading] = useState(true);
  
  // Estados para las métricas
  const [metricas, setMetricas] = useState({
    ingresosTotales: 0,
    totalCitasMes: 0,
    serviciosCompletados: 0,
    promedioSatisfaccion: '0.0',
    totalResenas: 0
  });

  // Estados para los gráficos
  const [ventasMensuales, setVentasMensuales] = useState<any[]>([]);
  const [distribucionCitas, setDistribucionCitas] = useState<any[]>([]);
  const [topProductos, setTopProductos] = useState<any[]>([]);
  const [topServicios, setTopServicios] = useState<any[]>([]);

  useEffect(() => {
    cargarMetricas();
  }, []);

  const cargarMetricas = async () => {
    try {
      setLoading(true);
      
      // Consultamos todos los datos necesarios en paralelo
      const [resOrdenes, resCitas, resResenas] = await Promise.all([
        fetch(`${API_URL}/api/ordenes`, { credentials: 'include' }),
        fetch(`${API_URL}/api/citas`, { credentials: 'include' }),
        fetch(`${API_URL}/api/reseñas`, { credentials: 'include' })
      ]);

      if (resOrdenes.status === 401) return (window.location.href = '/iniciar-sesion');

      const ordenes = await resOrdenes.json();
      const citas = await resCitas.json();
      const resenas = await resResenas.json();

      const hoy = new Date();
      const mesActual = hoy.getMonth();
      const añoActual = hoy.getFullYear();

      // --- 1. CÁLCULO DE MÉTRICAS GLOBALES ---
      const ordenesPagadas = ordenes.filter((o: any) => o.estadoRecojo === 'RECOGIDO');
      const citasCompletadas = citas.filter((c: any) => c.estado === 'COMPLETADA');
      
      const ingresosOrdenes = ordenesPagadas.reduce((sum: number, o: any) => sum + o.montoTotal, 0);
      const ingresosCitas = citasCompletadas.reduce((sum: number, c: any) => sum + (c.montoInicial || 0), 0);
      
      const citasEsteMes = citas.filter((c: any) => {
        const fechaCita = new Date(c.fecha + 'T00:00:00');
        return fechaCita.getMonth() === mesActual && fechaCita.getFullYear() === añoActual;
      });

      const promSat = resenas.length > 0 
        ? (resenas.reduce((sum: number, r: any) => sum + r.calificacion, 0) / resenas.length).toFixed(1) 
        : '0.0';

      setMetricas({
        ingresosTotales: ingresosOrdenes + ingresosCitas,
        totalCitasMes: citasEsteMes.length,
        serviciosCompletados: citasCompletadas.length,
        promedioSatisfaccion: promSat,
        totalResenas: resenas.length
      });

      // --- 2. GRÁFICO: VENTAS MENSUALES (Últimos 6 meses) ---
      const ultimos6Meses = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(añoActual, mesActual - i, 1);
        return { mesNum: d.getMonth(), año: d.getFullYear(), nombre: d.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase(), ingresos: 0 };
      }).reverse();

      // Sumar Órdenes a los meses
      ordenesPagadas.forEach((o: any) => {
        if (!o.fechaPago) return;
        const fecha = new Date(o.fechaPago);
        const mesIndex = ultimos6Meses.findIndex(m => m.mesNum === fecha.getMonth() && m.año === fecha.getFullYear());
        if (mesIndex !== -1) ultimos6Meses[mesIndex].ingresos += o.montoTotal;
      });

      // Sumar Citas (Servicios) a los meses
      citasCompletadas.forEach((c: any) => {
        const fecha = new Date(c.fecha + 'T00:00:00');
        const mesIndex = ultimos6Meses.findIndex(m => m.mesNum === fecha.getMonth() && m.año === fecha.getFullYear());
        if (mesIndex !== -1) ultimos6Meses[mesIndex].ingresos += (c.montoInicial || 0);
      });

      setVentasMensuales(ultimos6Meses);

      // --- 3. GRÁFICO: DISTRIBUCIÓN DE ESTADO DE CITAS ---
      const conteoEstados = citas.reduce((acc: any, cita: any) => {
        acc[cita.estado] = (acc[cita.estado] || 0) + 1;
        return acc;
      }, {});

      const formatEstados = Object.keys(conteoEstados).map(key => ({
        name: key.replace('_', ' '),
        value: conteoEstados[key],
        color: STATUS_COLORS[key] || '#9ca3af'
      }));
      setDistribucionCitas(formatEstados);

      // --- 4. GRÁFICO: TOP 5 PRODUCTOS MÁS VENDIDOS ---
      const mapProductos: { [key: string]: number } = {};
      ordenesPagadas.forEach((o: any) => {
        o.items?.forEach((item: any) => {
          const nombre = item.producto?.nombre || 'Desconocido';
          mapProductos[nombre] = (mapProductos[nombre] || 0) + item.cantidad;
        });
      });
      const topProdList = Object.keys(mapProductos)
        .map(nombre => ({ nombre, cantidad: mapProductos[nombre] }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 5); // Tomamos solo los 5 principales
      setTopProductos(topProdList);

      // --- 5. GRÁFICO: TOP SERVICIOS MÁS SOLICITADOS ---
      const mapServicios: { [key: string]: number } = {};
      citas.forEach((c: any) => {
        const nombre = c.servicio?.nombreServicio || 'Desconocido';
        mapServicios[nombre] = (mapServicios[nombre] || 0) + 1;
      });
      const topServList = Object.keys(mapServicios)
        .map(nombre => ({ nombre, cantidad: mapServicios[nombre] }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 5);
      setTopServicios(topServList);

    } catch (error) {
      toast.error('Error al procesar las métricas de reportes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Analizando datos y generando reportes...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-foreground">Panel de Reportes Operativos</h2>
        <p className="text-muted-foreground">Métricas financieras y rendimiento del taller</p>
      </div>

      {/* --- TARJETAS DE MÉTRICAS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card hover className="group">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Ingresos Globales</p>
                  <h3 className="text-accent text-2xl font-black">{formatCurrency(metricas.ingresosTotales)}</h3>
                </div>
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="text-accent" size={24} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                <span>Ventas de productos y servicios</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          <Card hover className="group">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Citas este Mes</p>
                  <h3 className="text-primary text-2xl font-black">{metricas.totalCitasMes}</h3>
                </div>
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="text-primary" size={24} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                <span>Agendadas en curso</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
          <Card hover className="group">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Servicios Finalizados</p>
                  <h3 className="text-green-500 text-2xl font-black">{metricas.serviciosCompletados}</h3>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Wrench className="text-green-500" size={24} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                <span>Histórico total</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }}>
          <Card hover className="group">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Satisfacción</p>
                  <h3 className="text-yellow-500 text-2xl font-black">{metricas.promedioSatisfaccion} / 5</h3>
                </div>
                <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Star className="text-yellow-500" size={24} />
                </div>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                Basado en {metricas.totalResenas} reseñas de clientes
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* --- GRÁFICOS Y DIAGRAMAS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* GRÁFICO 1: Ingresos Mensuales */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}>
          <Card hover>
            <CardHeader>
              <CardTitle>Ingresos Consolidados (Últimos 6 meses)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ventasMensuales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27293d" vertical={false} />
                  <XAxis dataKey="nombre" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `S/ ${value}`} />
                  <Tooltip
                    cursor={{ fill: '#ffffff10' }}
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #d4af37', borderRadius: '8px' }}
                    labelStyle={{ color: '#e8e9ed', fontWeight: 'bold', marginBottom: '4px' }}
                    formatter={(value: number) => [formatCurrency(value), 'Ingresos']}
                  />
                  <Bar dataKey="ingresos" fill="#d4af37" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* GRÁFICO 2: Estado del Flujo de Citas */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.5 }}>
          <Card hover>
            <CardHeader>
              <CardTitle>Estado del Flujo de Citas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={distribucionCitas}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {distribucionCitas.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #3b82f6', borderRadius: '8px' }}
                    itemStyle={{ color: '#e8e9ed' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* GRÁFICO 3: Top Productos */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.6 }}>
          <Card hover>
            <CardHeader>
              <CardTitle>Top 5 Productos Más Vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={topProductos}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ nombre, value }) => `${nombre.substring(0,10)}... (${value})`}
                    outerRadius={100}
                    dataKey="cantidad"
                  >
                    {topProductos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #d4af37', borderRadius: '8px' }}
                    itemStyle={{ color: '#e8e9ed' }}
                    formatter={(value: number) => [`${value} unidades`, 'Ventas']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* GRÁFICO 4: Top Servicios */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.7 }}>
          <Card hover className="h-full">
            <CardHeader>
              <CardTitle>Demanda de Servicios (Top 5)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 pt-4">
                {topServicios.length === 0 ? (
                  <p className="text-muted-foreground text-center">No hay datos de servicios aún.</p>
                ) : (
                  topServicios.map((servicio, index) => {
                    const maxCantidad = topServicios[0].cantidad; // El primero es el mayor
                    const porcentaje = (servicio.cantidad / maxCantidad) * 100;
                    
                    return (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-foreground">{servicio.nombre}</span>
                          <span className="text-sm font-black text-accent bg-accent/10 px-2 py-0.5 rounded">
                            {servicio.cantidad} citas
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${porcentaje}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="bg-primary h-full rounded-full"
                          />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  );
};