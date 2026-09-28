import { useState } from 'react';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { Bike, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface RecuperarForm {
  email: string;
}

export const RecuperarPasswordPage = () => {
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecuperarForm>();

  const onSubmit = async (data: RecuperarForm) => {
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success('Instrucciones enviadas a tu correo');
    setEnviado(true);
    setLoading(false);
  };

  if (enviado) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8 relative">
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-card border border-border rounded-2xl p-8 shadow-xl text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h2 className="mb-4 text-foreground">¡Correo Enviado!</h2>
            <p className="text-muted-foreground mb-6">
              Hemos enviado las instrucciones para restablecer tu contraseña a tu correo electrónico.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Si no recibes el correo en unos minutos, revisa tu carpeta de spam.
            </p>
            <Link to="/">
              <Button variant="accent" className="w-full">
                Volver al inicio de sesión
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8 relative">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-lg">
              <Bike size={32} className="text-accent-foreground" />
            </div>
          </Link>
          <h1 className="mb-2 text-foreground">Recuperar Contraseña</h1>
          <p className="text-muted-foreground">
            Ingresa tu correo y te enviaremos instrucciones
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-[42px] text-muted-foreground" />
              <Input
                label="Correo electrónico"
                type="email"
                placeholder="ejemplo@correo.com"
                className="pl-10"
                error={errors.email?.message}
                {...register('email', {
                  required: 'El correo es requerido',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Correo electrónico inválido',
                  },
                })}
              />
            </div>

            <Button type="submit" variant="accent" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Instrucciones'}
            </Button>

            <Link to="/">
              <Button variant="ghost" className="w-full gap-2" type="button">
                <ArrowLeft size={16} />
                Volver al inicio de sesión
              </Button>
            </Link>
          </form>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">
              💡 <strong>Nota:</strong> Recibirás un enlace para restablecer tu contraseña. El enlace
              será válido por 24 horas.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
