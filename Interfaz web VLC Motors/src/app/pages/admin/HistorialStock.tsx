import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { ArrowUp, ArrowDown, Package } from 'lucide-react';
import { motion } from 'motion/react';

const movimientos = [
  {
    id: 1,
    producto: 'Aceite Motor 20W-50',
    tipo: 'entrada',
    cantidad: 20,
    fecha: '2026-05-05',
    responsable: 'Admin VLC',
    motivo: 'Compra a proveedor',
  },
  {
    id: 2,
    producto: 'Filtro de Aceite',
    tipo: 'salida',
    cantidad: 5,
    fecha: '2026-05-04',
    responsable: 'Carlos López',
    motivo: 'Venta a cliente',
  },
  {
    id: 3,
    producto: 'Bujías NGK',
    tipo: 'entrada',
    cantidad: 30,
    fecha: '2026-05-03',
    responsable: 'Admin VLC',
    motivo: 'Compra a proveedor',
  },
  {
    id: 4,
    producto: 'Pastillas de Freno',
    tipo: 'salida',
    cantidad: 2,
    fecha: '2026-05-02',
    responsable: 'María García',
    motivo: 'Venta a cliente',
  },
  {
    id: 5,
    producto: 'Batería 12V',
    tipo: 'entrada',
    cantidad: 10,
    fecha: '2026-05-01',
    responsable: 'Admin VLC',
    motivo: 'Compra a proveedor',
  },
  {
    id: 6,
    producto: 'Cadena de Transmisión',
    tipo: 'salida',
    cantidad: 1,
    fecha: '2026-04-30',
    responsable: 'Carlos López',
    motivo: 'Venta a cliente',
  },
];

export const HistorialStock = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-foreground">Historial de Stock</h2>
        <p className="text-muted-foreground">Registro de movimientos de inventario</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0 }}
        >
        <Card hover>
          <CardContent className="p-5 text-center">
            <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mx-auto mb-3">
              <Package size={24} className="text-accent" />
            </div>
            <h3 className="text-accent mb-1">142</h3>
            <p className="text-sm text-muted-foreground">Movimientos este mes</p>
          </CardContent>
        </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
        <Card hover>
          <CardContent className="p-5 text-center">
            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mx-auto mb-3">
              <ArrowUp size={24} className="text-green-400" />
            </div>
            <h3 className="text-green-400 mb-1">320</h3>
            <p className="text-sm text-muted-foreground">Entradas totales</p>
          </CardContent>
        </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
        <Card hover>
          <CardContent className="p-5 text-center">
            <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center mx-auto mb-3">
              <ArrowDown size={24} className="text-red-400" />
            </div>
            <h3 className="text-red-400 mb-1">178</h3>
            <p className="text-sm text-muted-foreground">Salidas totales</p>
          </CardContent>
        </Card>
        </motion.div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movimientos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {movimientos.map((movimiento) => (
              <div key={movimiento.id} className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      movimiento.tipo === 'entrada' ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      {movimiento.tipo === 'entrada' ? (
                        <ArrowUp size={20} className="text-green-400" />
                      ) : (
                        <ArrowDown size={20} className="text-red-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">{movimiento.producto}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{movimiento.responsable}</span>
                        <span>•</span>
                        <span>{new Date(movimiento.fecha).toLocaleDateString('es-ES')}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{movimiento.motivo}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-semibold ${
                      movimiento.tipo === 'entrada' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {movimiento.tipo === 'entrada' ? '+' : '-'}{movimiento.cantidad}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {movimiento.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
