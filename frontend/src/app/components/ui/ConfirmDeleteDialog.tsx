import { ReactNode, useState } from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog';
import { Button } from './button';

interface ConfirmDeleteDialogProps {
  itemName: string;
  onConfirm: () => Promise<void>;
  children: ReactNode;
}

export const ConfirmDeleteDialog = ({ itemName, onConfirm, children }: ConfirmDeleteDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const confirmar = async () => {
    setLoading(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(nextOpen) => !loading && setOpen(nextOpen)}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro de eliminar esto?</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará {itemName}. Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button type="button" variant="outline" disabled={loading}>Cancelar</Button>
          </AlertDialogCancel>
          <Button type="button" variant="destructive" onClick={confirmar} disabled={loading}>
            {loading ? 'Eliminando…' : 'Sí, eliminar'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
