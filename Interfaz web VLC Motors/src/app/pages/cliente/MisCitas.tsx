import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/button';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, PlayCircle, Banknote, ReceiptText, Download } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import * as Dialog from '@radix-ui/react-dialog';
import { API_URL } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/currency';

interface Cita {
  idCita: number;
  fecha: string;
  hora: string;
  estado: string; // "PENDIENTE", "EN_PROGRESO", "COMPLETADA", "CANCELADA"
  pagoRegistrado?: boolean;
  montoPagado?: number;
  montoInicial?: number;
  metodoPago?: string;
  fechaPago?: string;
  observaciones?: string;
  cliente?: {
    nombre?: string;
    apellido?: string;
    tipoDocumento?: string;
    numeroDocumento?: string;
    dni?: string;
    email?: string;
    telefono?: string;
    direccion?: string;
    placaMototaxi?: string;
    marcaMototaxi?: string;
    modeloMototaxi?: string;
  };
  servicio: {
    nombreServicio: string;
  };
  trabajador?: {
    nombre: string;
    apellido: string;
  };
}

export const MisCitas = () => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [boletaCita, setBoletaCita] = useState<Cita | null>(null);

  const calcularImportes = (cita: Cita) => {
    const total = Math.round(Number(cita.montoPagado ?? 0) * 100) / 100;
    const base = Math.round((total / 1.18) * 100) / 100;
    return { total, base, igv: Math.round((total - base) * 100) / 100 };
  };

  const escaparHTML = (valor: string) => valor.replace(/[&<>"']/g, (caracter) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[caracter] as string);

  const exportarBoletaPDF = (cita: Cita) => {
    const ventana = window.open('', '_blank');
    if (!ventana) {
      toast.error('Permite las ventanas emergentes para exportar la boleta');
      return;
    }

    const { total, base, igv } = calcularImportes(cita);
    const cliente = cita.cliente;
    const nombreCliente = `${cliente?.nombre ?? ''} ${cliente?.apellido ?? ''}`.trim() || 'No disponible';
    const documento = cliente?.numeroDocumento || cliente?.dni || 'No disponible';
    const fechaCita = new Date(`${cita.fecha}T00:00:00`).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
    const fechaEmision = cita.fechaPago ? new Date(cita.fechaPago).toLocaleString('es-PE') : fechaCita;
    const numeroBoleta = `B001-${String(cita.idCita).padStart(8, '0')}`;
    const fila = (etiqueta: string, valor: string) => `<tr><td>${escaparHTML(etiqueta)}</td><td>${escaparHTML(valor || 'No disponible')}</td></tr>`;

    ventana.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Boleta informativa - Cita ${cita.idCita}</title>
      <style>
        *{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#172033;margin:0;padding:36px;background:#f1f5f9}
        .receipt{max-width:760px;margin:auto;background:white;padding:42px;border:1px solid #dbe2ea;border-radius:12px}
        header{display:flex;justify-content:space-between;gap:24px;border-bottom:2px solid #c59d36;padding-bottom:20px;margin-bottom:24px}
        h1{font-size:22px;margin:0 0 6px}h2{font-size:14px;text-transform:uppercase;letter-spacing:.08em;color:#475569;margin:25px 0 8px}
        p{margin:5px 0;font-size:13px;color:#475569}.number{text-align:right;font-weight:bold;color:#9a7620}.number strong{display:block;font-size:20px;margin-top:6px}
        table{width:100%;border-collapse:collapse;font-size:13px}td{padding:9px 4px;border-bottom:1px solid #e5e7eb}td:first-child{color:#64748b;width:38%}
        .amounts{width:320px;margin:20px 0 0 auto}.amounts td{padding:8px 4px}.amounts tr:last-child{font-size:17px;font-weight:bold;color:#172033}
        @media print{body{background:white;padding:0}.receipt{border:0;border-radius:0;max-width:none;padding:20px}}
      </style></head><body><main class="receipt">
      <header><div><h1>Boleta de venta electrónica</h1><p>VLC Motors · RUC: 20123456789</p><p>Fecha de emisión: ${escaparHTML(fechaEmision)}</p></div>
      <div class="number">N.º BOLETA<strong>${escaparHTML(numeroBoleta)}</strong></div></header>
      <h2>Cliente</h2><table>${fila('Nombre', nombreCliente)}${fila('Documento', `${cliente?.tipoDocumento || (cliente?.dni ? 'DNI' : 'Documento')}: ${documento}`)}</table>
      <h2>Detalle</h2><table>${fila('Servicio', cita.servicio?.nombreServicio || 'Servicio no especificado')}${fila('Fecha de atención', fechaCita)}</table>
      <h2>Pago</h2><table>${fila('Fecha de pago', fechaEmision)}${fila('Medio de pago', cita.metodoPago?.replace('_', ' ').toLowerCase() || '')}</table>
      <table class="amounts"><tr><td>Valor de venta</td><td>${formatCurrency(base)}</td></tr><tr><td>IGV (18%, incluido)</td><td>${formatCurrency(igv)}</td></tr><tr><td>Total pagado</td><td>${formatCurrency(total)}</td></tr></table>
      </main><script>window.onload=()=>{window.focus();window.print()}</script></body></html>`);
    ventana.document.close();
  };

  useEffect(() => {
    cargarCitas();
  }, []);

  const cargarCitas = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/citas/mis-citas`, {
        credentials: 'include'
      });
      
      if (res.status === 401) {
        window.location.href = '/iniciar-sesion';
        return;
      }
      
      if (res.ok) {
        const data = await res.json();
        const prioridad = (cita: Cita) => {
          const estado = cita.estado?.toUpperCase();
          if (estado === 'PENDIENTE') return 0;
          if (estado === 'EN_PROGRESO') return 1;
          if (estado === 'COMPLETADA' && !cita.pagoRegistrado) return 2;
          if (estado === 'COMPLETADA') return 3;
          if (estado === 'CANCELADA') return 4;
          return 5;
        };
        const ordenadas = data.sort((a: Cita, b: Cita) => {
          const diferenciaEstado = prioridad(a) - prioridad(b);
          if (diferenciaEstado !== 0) return diferenciaEstado;
          const fechaA = new Date(`${a.fecha}T${a.hora}`).getTime();
          const fechaB = new Date(`${b.fecha}T${b.hora}`).getTime();
          return prioridad(a) <= 1 ? fechaA - fechaB : fechaB - fechaA;
        });
        setCitas(ordenadas);
      }
    } catch (error) {
      toast.error('Error al cargar tu historial de citas');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async (id: number) => {
    // Pequeña confirmación antes de cancelar
    if (!window.confirm("¿Estás seguro de que deseas cancelar esta cita?")) return;

    try {
      const res = await fetch(`${API_URL}/api/citas/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ estado: 'CANCELADA' })
      });

      if (res.status === 401) {
        window.location.href = '/iniciar-sesion';
        return;
      }

      if (!res.ok) throw new Error('Error al cancelar');

      toast.success('Cita cancelada exitosamente');
      await cargarCitas(); // Recargar la lista para ver el cambio instantáneo
    } catch (error) {
      toast.error('No se pudo cancelar la cita');
    }
  };

  // Función para manejar los colores en modo Claro y Oscuro dinámicamente
  const getEstadoConfig = (cita: Cita) => {
    const estado = cita.estado;
    switch (estado?.toUpperCase()) {
      case 'PENDIENTE':
        return {
          icon: AlertCircle,
          colorClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400',
          label: 'Pendiente',
        };
      case 'EN_PROGRESO':
        return {
          icon: PlayCircle,
          colorClass: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400',
          label: 'En Progreso',
        };
      case 'COMPLETADA':
        if (!cita.pagoRegistrado) {
          return {
            icon: Banknote,
            colorClass: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400',
            label: 'Completada · pendiente de pago',
          };
        }
        return {
          icon: CheckCircle,
          colorClass: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400',
          label: 'Completada',
        };
      case 'CANCELADA':
        return {
          icon: XCircle,
          colorClass: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400',
          label: 'Cancelada',
        };
      default:
        return {
          icon: AlertCircle,
          colorClass: 'bg-muted text-muted-foreground',
          label: estado,
        };
    }
  };

  return (
    <>
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-foreground">Mis Citas</h2>
        <p className="text-muted-foreground">Historial de tus citas programadas</p>
      </div>

      {loading ? (
        <div className="text-center p-8 text-muted-foreground">Cargando tus citas...</div>
      ) : citas.length === 0 ? (
        <div className="text-center p-12 bg-card border border-border rounded-xl">
          <Calendar size={40} className="mx-auto mb-3 opacity-20" />
          <p className="text-muted-foreground">Aún no tienes ninguna cita programada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {citas.map((cita, index) => {
            const config = getEstadoConfig(cita);
            const Icon = config.icon;

            return (
              <motion.div
                key={cita.idCita}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card hover>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="mb-1 text-card-foreground">
                          {cita.servicio?.nombreServicio || 'Servicio no especificado'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Mecánico:{' '}
                          {cita.trabajador 
                            ? `${cita.trabajador.nombre} ${cita.trabajador.apellido}`
                            : 'Por asignar'}
                        </p>
                      </div>
                      <span className={`flex max-w-[190px] items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.colorClass}`}>
                        <Icon size={14} />
                        <span>{config.label}</span>
                      </span>
                    </div>

                    {cita.estado === 'COMPLETADA' && cita.pagoRegistrado && (
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs text-green-700 dark:text-green-400">
                          Pago presencial registrado{cita.montoPagado !== undefined ? `: S/ ${Number(cita.montoPagado).toFixed(2)}` : ''}.
                        </p>
                        <Button variant="outline" size="sm" onClick={() => setBoletaCita(cita)}>
                          <ReceiptText size={15} /> Ver boleta
                        </Button>
                      </div>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar size={16} />
                        <span className="capitalize">
                          {new Date(cita.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock size={16} />
                        <span>{cita.hora.substring(0, 5)} hs</span>
                      </div>
                    </div>

                    {/* El botón solo aparece si el estado es PENDIENTE */}
                    {cita.estado === 'PENDIENTE' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => handleCancelar(cita.idCita)}
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
      )}
    </div>

    <Dialog.Root open={Boolean(boletaCita)} onOpenChange={(open) => !open && setBoletaCita(null)}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 duration-200 fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 duration-200 fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-2xl sm:p-7">
          {boletaCita && (() => {
            const { total, base, igv } = calcularImportes(boletaCita);
            const cliente = boletaCita.cliente;
            const numeroBoleta = `B001-${String(boletaCita.idCita).padStart(8, '0')}`;
            return <>
              <div className="mb-5 flex items-start justify-between gap-4 border-b border-border pb-4">
                <div>
                  <Dialog.Title className="text-xl font-bold text-card-foreground">Boleta de venta electrónica</Dialog.Title>
                  <Dialog.Description className="mt-1 text-sm text-muted-foreground">VLC Motors · RUC: 20123456789 · Boleta N.º {numeroBoleta}</Dialog.Description>
                  <p className="mt-1 text-xs text-muted-foreground">Av. Ejemplo 123, Lima, Perú</p>
                </div>
                <ReceiptText className="text-accent" size={28} />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <section className="space-y-1 text-sm">
                  <h3 className="mb-2 font-semibold text-foreground">Cliente</h3>
                  <p className="text-muted-foreground">{cliente?.nombre} {cliente?.apellido}</p>
                  <p className="text-muted-foreground">{cliente?.tipoDocumento || 'Documento'}: {cliente?.numeroDocumento || cliente?.dni || 'No disponible'}</p>
                  <p className="text-muted-foreground">Teléfono: {cliente?.telefono || 'No disponible'}</p>
                  <p className="break-all text-muted-foreground">Correo: {cliente?.email || 'No disponible'}</p>
                  <p className="text-muted-foreground">Dirección: {cliente?.direccion || 'No disponible'}</p>
                </section>
                <section className="space-y-1 text-sm">
                  <h3 className="mb-2 font-semibold text-foreground">Cita y vehículo</h3>
                  <p className="text-muted-foreground">Servicio: {boletaCita.servicio?.nombreServicio}</p>
                  <p className="text-muted-foreground">Fecha: {new Date(`${boletaCita.fecha}T00:00:00`).toLocaleDateString('es-PE')}</p>
                  <p className="text-muted-foreground">Hora: {boletaCita.hora.substring(0, 5)}</p>
                  <p className="text-muted-foreground">Trabajador: {boletaCita.trabajador ? `${boletaCita.trabajador.nombre} ${boletaCita.trabajador.apellido}` : 'No asignado'}</p>
                  <p className="text-muted-foreground">Vehículo: {[cliente?.marcaMototaxi, cliente?.modeloMototaxi].filter(Boolean).join(' ') || 'No disponible'}</p>
                  <p className="text-muted-foreground">Placa: {cliente?.placaMototaxi || 'No disponible'}</p>
                </section>
              </div>
              {boletaCita.observaciones && <div className="mt-4 rounded-lg bg-muted p-3 text-sm"><span className="font-medium">Observaciones:</span> {boletaCita.observaciones}</div>}
              <section className="mt-5 rounded-lg border border-border p-4">
                <h3 className="mb-3 font-semibold text-foreground">Pago presencial</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4"><span className="text-muted-foreground">Método</span><span className="font-medium capitalize">{boletaCita.metodoPago?.replace('_', ' ').toLowerCase() || 'No disponible'}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-muted-foreground">Fecha de pago</span><span>{boletaCita.fechaPago ? new Date(boletaCita.fechaPago).toLocaleString('es-PE') : 'No disponible'}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-muted-foreground">Valor de venta</span><span>{formatCurrency(base)}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-muted-foreground">IGV (18%, incluido)</span><span>{formatCurrency(igv)}</span></div>
                  <div className="flex justify-between gap-4 border-t border-border pt-2 text-base font-bold"><span>Total pagado</span><span className="text-accent">{formatCurrency(total)}</span></div>
                </div>
              </section>
              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button variant="ghost" onClick={() => setBoletaCita(null)}>Cerrar</Button>
                <Button variant="accent" onClick={() => exportarBoletaPDF(boletaCita)}><Download size={16} /> Exportar PDF</Button>
              </div>
            </>;
          })()}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
    </>
  );
};
