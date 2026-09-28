import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Plus, Edit2, Trash2, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';
import { Input } from '../../components/ui/input';
import { formatCurrency } from '../../utils/currency';
import { API_URL } from '../../context/AuthContext';

interface Servicio {
  id: number;
  nombre: string;
  duracion: string;
  precio: number;
  descripcion: string;
  duracionEstimadaMinutos: number;
}

interface ServicioForm {
  nombre: string;
  duracionEstimadaMinutos: number;
  precio: number;
  descripcion: string;
}

const servicioInicial: ServicioForm = {
  nombre: '',
  duracionEstimadaMinutos: 30,
  precio: 0,
  descripcion: '',
};

export const Servicios = () => {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [servicioEditando, setServicioEditando] = useState<Servicio | null>(null);
  const [form, setForm] = useState<ServicioForm>(servicioInicial);

const cargarServicios = async () => {
    try {
      const res = await fetch(`${API_URL}/api/servicios`, {
        credentials: 'include',
      });

      // --- NUEVA LÓGICA PARA MANEJAR LA SESIÓN MUERTA ---
      if (res.status === 401) {
        toast.error('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
        // Opcional: Limpiar localStorage si guardas datos del usuario ahí
        // localStorage.removeItem('user'); 
        
        // Redirigir al usuario a la vista de login
        window.location.href = '/iniciar-sesion'; 
        return; // Detenemos la ejecución aquí
      }
      // --------------------------------------------------

      if (!res.ok) throw new Error('No se pudo cargar los servicios');
      
      const data = await res.json();

      const serviciosMapeados = data.map((item: any) => ({
        id: item.idServicio,
        nombre: item.nombreServicio,
        duracion: `${item.duracionEstimadaMinutos ?? 0} min`,
        precio: item.precioInicial ?? 0,
        descripcion: item.descripcionServicio,
        duracionEstimadaMinutos: item.duracionEstimadaMinutos ?? 0,
      }));

      setServicios(serviciosMapeados);
    } catch (error) {
      console.error(error);
      toast.error('No se pudieron cargar los servicios');
    }
  };

  useEffect(() => {
    cargarServicios();
  }, []);

  const eliminar = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/servicios/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Error al eliminar');
      await cargarServicios();
      toast.success('Servicio eliminado');
    } catch (error) {
      console.error(error);
      toast.error('No se pudo eliminar el servicio');
    }
  };

  const abrirModal = (servicio?: Servicio) => {
    if (servicio) {
      setServicioEditando(servicio);
      setForm({
        nombre: servicio.nombre,
        duracionEstimadaMinutos: servicio.duracionEstimadaMinutos,
        precio: servicio.precio,
        descripcion: servicio.descripcion,
      });
    } else {
      setServicioEditando(null);
      setForm(servicioInicial);
    }
    setModalAbierto(true);
  };

  const guardar = async () => {
    if (!form.nombre.trim()) {
      toast.error('El nombre del servicio no puede estar vacío');
      return;
    }

    if (!form.descripcion.trim()) {
      toast.error('La descripción del servicio no puede estar vacía');
      return;
    }

    if (form.precio < 0) {
      toast.error('El precio inicial debe ser cero o un valor positivo');
      return;
    }

    if (form.duracionEstimadaMinutos <= 0) {
      toast.error('La duración estimada debe ser mayor que cero');
      return;
    }

    const payload = {
      nombreServicio: form.nombre.trim(),
      descripcionServicio: form.descripcion.trim(),
      precioInicial: Number(form.precio),
      duracionEstimadaMinutos: Number(form.duracionEstimadaMinutos),
    };

    try {
      const url = servicioEditando
        ? `${API_URL}/api/servicios/${servicioEditando.id}`
        : `${API_URL}/api/servicios`;
      const method = servicioEditando ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // Leemos la respuesta de error real del servidor
        const errorDetail = await res.text();
        console.error(`Error del servidor (Código ${res.status}):`, errorDetail);
        throw new Error(`Fallo en el servidor: ${res.status}`);
      }



      await cargarServicios();
      toast.success(servicioEditando ? 'Servicio actualizado' : 'Servicio creado');
      setModalAbierto(false);
      setServicioEditando(null);
      setForm(servicioInicial);
    } catch (error) {
      console.error(error);
      toast.error('No se pudo guardar el servicio');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-2 text-foreground">Servicios</h2>
          <p className="text-muted-foreground">Gestiona los servicios ofrecidos</p>
        </div>
        <Button variant="accent" onClick={() => abrirModal()} className="gap-2">
          <Plus size={18} />
          Nuevo Servicio
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-4 text-foreground">Servicio</th>
              <th className="text-left p-4 text-foreground">Duración</th>
              <th className="text-left p-4 text-foreground">Precio</th>
              <th className="text-left p-4 text-foreground">Descripción</th>
              <th className="text-right p-4 text-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {servicios.map((servicio) => (
              <tr key={servicio.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                      <Wrench size={18} className="text-accent" />
                    </div>
                    <span className="font-medium text-foreground">{servicio.nombre}</span>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground">{servicio.duracion}</td>
                <td className="p-4 text-accent font-semibold">{formatCurrency(servicio.precio)}</td>
                <td className="p-4 text-muted-foreground text-sm">{servicio.descripcion}</td>
                <td className="p-4">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => abrirModal(servicio)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => eliminar(servicio.id)}
                      className="p-2 hover:bg-destructive/20 rounded-lg transition-colors text-destructive"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog.Root open={modalAbierto} onOpenChange={setModalAbierto}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl">
            <Dialog.Title className="mb-6 text-card-foreground">
              {servicioEditando ? 'Editar Servicio' : 'Nuevo Servicio'}
            </Dialog.Title>

            <div className="space-y-4">
              <Input
                label="Nombre del servicio"
                placeholder="Mantenimiento General"
                value={form.nombre}
                onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
              />
              <Input
                label="Duración estimada (minutos)"
                type="number"
                placeholder="45"
                value={form.duracionEstimadaMinutos}
                onChange={(e) => setForm((prev) => ({ ...prev, duracionEstimadaMinutos: Number(e.target.value) }))}
              />
              <Input
                label="Precio"
                type="number"
                placeholder="50"
                value={form.precio}
                onChange={(e) => setForm((prev) => ({ ...prev, precio: Number(e.target.value) }))}
              />
              <div>
                <label className="block text-sm mb-2 text-foreground">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Descripción del servicio..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-input-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
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