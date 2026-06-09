import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/button';
import { Plus, Edit2, Trash2, Tag, Calendar, Package } from 'lucide-react';
import { toast } from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';
import { Input } from '../../components/ui/input';
import { API_URL } from '../../context/AuthContext';

interface Oferta {
  idOferta: number;
  titulo: string;
  descuento: number;
  fechaInicio: string;
  fechaFin: string;
  productos?: any[];
}

const formDataInicial = {
  titulo: '',
  descuento: 0,
  fechaInicio: '',
  fechaFin: '',
  productoId: 0, // Listo para cuando conectemos con Productos
};

export const Ofertas = () => {
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [productosDisponibles, setProductosDisponibles] = useState<any[]>([]); // Para el combobox
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [ofertaEditando, setOfertaEditando] = useState<Oferta | null>(null);
  const [formData, setFormData] = useState(formDataInicial);

  useEffect(() => {
    cargarOfertas();
    cargarProductos();
  }, []);

  const cargarOfertas = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/ofertas`, { credentials: 'include' });
      if (res.status === 401) return (window.location.href = '/iniciar-sesion');
      if (!res.ok) throw new Error('Error al cargar');
      setOfertas(await res.json());
    } catch (error) {
      toast.error('Error al cargar las ofertas');
    } finally {
      setLoading(false);
    }
  };

  // Esta función preparará tu combobox para el futuro
  const cargarProductos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/productos`, { credentials: 'include' });
      if (res.ok) setProductosDisponibles(await res.json());
    } catch (error) {
      // Ignoramos silenciosamente si la ruta de productos aún no existe
    }
  };

  const eliminar = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/ofertas/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.status === 401) return (window.location.href = '/iniciar-sesion');
      if (!res.ok) throw new Error('Error');
      await cargarOfertas();
      toast.success('Oferta eliminada');
    } catch (error) {
      toast.error('No se pudo eliminar la oferta');
    }
  };

  const abrirModal = (oferta?: Oferta) => {
    if (oferta) {
      setOfertaEditando(oferta);
      setFormData({
        titulo: oferta.titulo,
        descuento: oferta.descuento,
        fechaInicio: oferta.fechaInicio,
        fechaFin: oferta.fechaFin,
        productoId: 0,
      });
    } else {
      setOfertaEditando(null);
      setFormData(formDataInicial);
    }
    setModalAbierto(true);
  };

  const guardar = async () => {
    if (!formData.titulo.trim()) return toast.error('El título es obligatorio');
    if (formData.descuento <= 0 || formData.descuento > 100) return toast.error('El descuento debe ser entre 1 y 100');
    if (!formData.fechaInicio || !formData.fechaFin) return toast.error('Debe seleccionar las fechas');

    // Validación de fecha lógica
    if (new Date(formData.fechaInicio) > new Date(formData.fechaFin)) {
      return toast.error('La fecha de inicio no puede ser mayor a la fecha de fin');
    }

    try {
      const url = ofertaEditando ? `${API_URL}/api/ofertas/${ofertaEditando.idOferta}` : `${API_URL}/api/ofertas`;
      const method = ofertaEditando ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          titulo: formData.titulo,
          descuento: formData.descuento,
          fechaInicio: formData.fechaInicio,
          fechaFin: formData.fechaFin,
        }),
      });

      if (res.status === 401) return (window.location.href = '/iniciar-sesion');
      if (!res.ok) throw new Error('Error al guardar');

      // NOTA FUTURA: Aquí luego haremos otra petición para actualizar el Producto seleccionado con el ID de esta oferta.

      await cargarOfertas();
      toast.success(ofertaEditando ? 'Oferta actualizada' : 'Oferta creada');
      setModalAbierto(false);
    } catch (error) {
      toast.error('Ocurrió un error al guardar');
    }
  };

  // Evalúa el estado de la oferta dinámicamente en el frontend
  const determinarEstado = (inicio: string, fin: string) => {
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    const dateInicio = new Date(inicio + 'T00:00:00');
    const dateFin = new Date(fin + 'T00:00:00');
    
    if (hoy < dateInicio) return { texto: 'Programada', color: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400' };
    if (hoy > dateFin) return { texto: 'Expirada', color: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400' };
    return { texto: 'Activa', color: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-2 text-foreground">Ofertas</h2>
          <p className="text-muted-foreground">Administra promociones y descuentos</p>
        </div>
        <Button variant="accent" onClick={() => abrirModal()} className="gap-2">
          <Plus size={18} />
          Nueva Oferta
        </Button>
      </div>

      {loading ? (
        <div className="text-center p-8 text-muted-foreground">Cargando ofertas...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ofertas.map((oferta) => {
            const estado = determinarEstado(oferta.fechaInicio, oferta.fechaFin);
            
            return (
              <Card key={oferta.idOferta} hover>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                        <Tag size={20} className="text-accent" />
                      </div>
                      <div>
                        <h4 className="text-card-foreground line-clamp-1">{oferta.titulo}</h4>
                        <p className="text-sm text-accent font-bold">{oferta.descuento}% OFF</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 p-3 bg-muted rounded-lg text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${estado.color}`}>
                        {estado.texto}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar size={12} /> Inicio:
                      </div>
                      <span className="text-foreground">{oferta.fechaInicio}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar size={12} /> Fin:
                      </div>
                      <span className="text-foreground">{oferta.fechaFin}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="flex-1 gap-2" onClick={() => abrirModal(oferta)}>
                      <Edit2 size={14} />
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm" className="gap-2" onClick={() => eliminar(oferta.idOferta)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog.Root open={modalAbierto} onOpenChange={setModalAbierto}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl">
            <Dialog.Title className="mb-6 text-card-foreground">
              {ofertaEditando ? 'Editar Oferta' : 'Nueva Oferta'}
            </Dialog.Title>

            <div className="space-y-4">
              <Input label="Título de la oferta" placeholder="Descuento Mantenimiento" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} />
              <Input label="Descuento (%)" type="number" placeholder="15" value={formData.descuento} onChange={e => setFormData({...formData, descuento: Number(e.target.value)})} />
              
              {/* COMBOBOX DINÁMICO DE PRODUCTOS */}
              <div>
                <label className="block text-sm mb-2 text-foreground font-medium flex items-center gap-2">
                  <Package size={14} /> Aplica al Producto
                </label>
                <select
                  value={formData.productoId}
                  onChange={(e) => setFormData({ ...formData, productoId: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value={0}>Seleccione un producto (Opcional)</option>
                  {productosDisponibles.map(prod => (
                    <option key={prod.idProducto} value={prod.idProducto}>
                      {/* Aquí estaba el error: debe ser prod.nombre, no prod.nombreProducto */}
                      {prod.nombre} 
                    </option>
                  ))}
                </select>
                {productosDisponibles.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">Crea productos primero para asignarlos.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Fecha inicio" type="date" value={formData.fechaInicio} onChange={e => setFormData({...formData, fechaInicio: e.target.value})} />
                <Input label="Fecha fin" type="date" value={formData.fechaFin} onChange={e => setFormData({...formData, fechaFin: e.target.value})} />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="ghost" className="flex-1" onClick={() => setModalAbierto(false)}>
                Cancelar
              </Button>
              <Button variant="accent" className="flex-1" onClick={guardar}>
                Guardar
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};