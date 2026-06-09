import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Users, Calendar } from 'lucide-react';
import { formatCurrencyCompact } from '../../utils/currency';
import { motion } from 'motion/react';

const ventasData = [
  { mes: 'Ene', ventas: 4200 },
  { mes: 'Feb', ventas: 3800 },
  { mes: 'Mar', ventas: 5100 },
  { mes: 'Abr', ventas: 4600 },
  { mes: 'May', ventas: 5800 },
];

const citasData = [
  { dia: 'Lun', citas: 12 },
  { dia: 'Mar', citas: 15 },
  { dia: 'Mié', citas: 10 },
  { dia: 'Jue', citas: 18 },
  { dia: 'Vie', citas: 14 },
  { dia: 'Sáb', citas: 8 },
];

const productosData = [
  { nombre: 'Aceite', valor: 350 },
  { nombre: 'Filtros', valor: 220 },
  { nombre: 'Bujías', valor: 180 },
  { nombre: 'Frenos', valor: 280 },
  { nombre: 'Otros', valor: 150 },
];

const COLORS = ['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd', '#d4af37'];

export const Reportes = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-foreground">Panel de Reportes</h2>
        <p className="text-muted-foreground">Visualización de métricas y estadísticas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0 }}
        >
          <Card hover className="group">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Ventas Totales</p>
                  <h3 className="text-accent">{formatCurrencyCompact(23500)}</h3>
                </div>
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="text-accent" size={24} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-green-400">
                <TrendingUp size={14} />
                <span>+12% vs mes anterior</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card hover className="group">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Citas del Mes</p>
                  <h3 className="text-accent">156</h3>
                </div>
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="text-primary" size={24} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-green-400">
                <TrendingUp size={14} />
                <span>+8% vs mes anterior</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card hover className="group">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Clientes Activos</p>
                  <h3 className="text-accent">342</h3>
                </div>
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="text-primary" size={24} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-green-400">
                <TrendingUp size={14} />
                <span>+15% vs mes anterior</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card hover className="group">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Satisfacción</p>
                  <h3 className="text-accent">4.8/5</h3>
                </div>
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="text-accent" size={24} />
                </div>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                Basado en 89 reseñas
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
        <Card hover>
          <CardHeader>
            <CardTitle>Ventas Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ventasData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27293d" />
                <XAxis dataKey="mes" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #d4af37' }}
                  labelStyle={{ color: '#e8e9ed' }}
                />
                <Bar dataKey="ventas" fill="#d4af37" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Citas Semanales</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={citasData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27293d" />
                <XAxis dataKey="dia" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #1e3a8a' }}
                  labelStyle={{ color: '#e8e9ed' }}
                />
                <Line type="monotone" dataKey="citas" stroke="#1e3a8a" strokeWidth={3} dot={{ fill: '#1e3a8a', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
        <Card hover>
          <CardHeader>
            <CardTitle>Distribución de Productos Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={productosData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ nombre, percent }) => `${nombre} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {productosData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #d4af37' }}
                  labelStyle={{ color: '#e8e9ed' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
        <Card hover>
          <CardHeader>
            <CardTitle>Top Servicios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { nombre: 'Mantenimiento General', cantidad: 45, color: 'bg-accent' },
                { nombre: 'Cambio de Aceite', cantidad: 38, color: 'bg-primary' },
                { nombre: 'Afinamiento Completo', cantidad: 32, color: 'bg-blue-400' },
                { nombre: 'Revisión de Frenos', cantidad: 25, color: 'bg-blue-300' },
                { nombre: 'Cambio de Llantas', cantidad: 16, color: 'bg-blue-200' },
              ].map((servicio, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-foreground">{servicio.nombre}</span>
                    <span className="text-sm font-semibold text-accent">{servicio.cantidad}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`${servicio.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${(servicio.cantidad / 45) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        </motion.div>
      </div>
    </div>
  );
};
