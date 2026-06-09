import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/button';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import { toast } from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';
import { Input } from '../../components/ui/input';

interface Oferta {
  id: number;
  nombre: string;
  descuento: number;
  fechaInicio: string;
  fechaFin: string;
  aplicaA: string;
}

const ofertasIniciales: Oferta[] = [
  { id: 1, nombre: 'Descuento Mantenimiento', descuento: 15, fechaInicio: '2026-05-01', fechaFin: '2026-05-31', aplicaA: 'Mantenimiento General' },
  { id: 2, nombre: 'Promo Aceite + Filtro', descuento: 20, fechaInicio: '2026-05-10', fechaFin: '2026-05-20', aplicaA: 'Productos' },
  { id: 3, nombre: 'Descuento Afinamiento', descuento: 10, fechaInicio: '2026-05-15', fechaFin: '2026-06-15', aplicaA: 'Afinamiento Completo' },
];

export const Ofertas = () => {
  const [ofertas, setOfertas] = useState(ofertasIniciales);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [ofertaEditando, setOfertaEditando] = useState<Oferta | null>(null);

  const eliminar = (id: number) => {
    setOfertas(ofertas.filter((o) => o.id !== id));
    toast.success('Oferta eliminada');
  };

  const abrirModal = (oferta?: Oferta) => {
    setOfertaEditando(oferta || null);
    setModalAbierto(true);
  };

  const guardar = () => {
    toast.success(ofertaEditando ? 'Oferta actualizada' : 'Oferta creada');
    setModalAbierto(false);
    setOfertaEditando(null);
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ofertas.map((oferta) => (
          <Card key={oferta.id} hover>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Tag size={20} className="text-accent" />
                  </div>
                  <div>
                    <h4 className="text-card-foreground">{oferta.nombre}</h4>
                    <p className="text-sm text-accent font-bold">{oferta.descuento}% OFF</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4 p-3 bg-muted rounded-lg text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Aplica a:</span>
                  <span className="text-foreground font-medium">{oferta.aplicaA}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Inicio:</span>
                  <span className="text-foreground">{new Date(oferta.fechaInicio).toLocaleDateString('es-ES')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fin:</span>
                  <span className="text-foreground">{new Date(oferta.fechaFin).toLocaleDateString('es-ES')}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="flex-1 gap-2" onClick={() => abrirModal(oferta)}>
                  <Edit2 size={14} />
                  Editar
                </Button>
                <Button variant="destructive" size="sm" className="gap-2" onClick={() => eliminar(oferta.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog.Root open={modalAbierto} onOpenChange={setModalAbierto}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl">
            <Dialog.Title className="mb-6 text-card-foreground">
              {ofertaEditando ? 'Editar Oferta' : 'Nueva Oferta'}
            </Dialog.Title>

            <div className="space-y-4">
              <Input label="Nombre de la oferta" placeholder="Descuento Mantenimiento" defaultValue={ofertaEditando?.nombre} />
              <Input label="Descuento (%)" type="number" placeholder="15" defaultValue={ofertaEditando?.descuento} />
              <Input label="Aplica a" placeholder="Mantenimiento General" defaultValue={ofertaEditando?.aplicaA} />
              <Input label="Fecha inicio" type="date" defaultValue={ofertaEditando?.fechaInicio} />
              <Input label="Fecha fin" type="date" defaultValue={ofertaEditando?.fechaFin} />
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
