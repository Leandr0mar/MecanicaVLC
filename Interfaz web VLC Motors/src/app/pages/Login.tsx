import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { Wrench, Bike, Lock, Mail, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

interface LoginForm {
  email: string;
  password: string;
  recordarme: boolean;
}

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);

    try {
      const user = await login(data.email, data.password);

      if (user) {
        toast.success('¡Inicio de sesión exitoso!');

        if (user.rol === 'admin') {
          navigate('/admin');
        } else if (user.rol === 'trabajador') {
          navigate('/trabajador');
        } else {
          navigate('/cliente');
        }
      } else {
        toast.error('Credenciales incorrectas');
      }
    } catch (error) {
      toast.error('Error al iniciar sesión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex relative">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex items-center justify-center p-8"
      >
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-lg">
                <Bike size={32} className="text-accent-foreground" />
              </div>
            </div>
            <h1 className="mb-2 text-foreground">VLC Mototaxis</h1>
            <p className="text-muted-foreground">Sistema de Gestión de Mecánica</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
            <h2 className="mb-6 text-center">Iniciar Sesión</h2>

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

              <div className="relative">
                <Lock size={18} className="absolute left-3 top-[42px] text-muted-foreground" />
                <Input
                  label="Contraseña"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  error={errors.password?.message}
                  {...register('password', {
                    required: 'La contraseña es requerida',
                    minLength: {
                      value: 6,
                      message: 'Mínimo 6 caracteres',
                    },
                  })}
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded accent-accent" {...register('recordarme')} />
                  <span className="text-foreground">Recordarme</span>
                </label>
                <Link to="/recuperar-password" className="text-accent hover:text-accent/80 transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <Button type="submit" variant="accent" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Iniciando...' : 'Iniciar Sesión'}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                ¿No tienes cuenta?{' '}
                <Link to="/registro" className="text-accent hover:text-accent/80 transition-colors font-medium">
                  Registrarse
                </Link>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-start gap-2 mb-3 p-3 bg-muted/50 rounded-lg">
                <AlertCircle size={16} className="text-accent mt-0.5 flex-shrink-0" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Cuentas de prueba:</p>
                  <div className="space-y-1">
                    <p>👤 Cliente: <span className="text-accent">cliente@vlc.com</span> / <span className="text-accent">cliente123</span></p>
                    <p>🔧 Trabajador: <span className="text-accent">trabajador@vlc.com</span> / <span className="text-accent">trabajador123</span></p>
                    <p>⚙️ Admin: <span className="text-accent">admin@vlc.com</span> / <span className="text-accent">admin123</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="hidden lg:flex flex-1 bg-gradient-to-br from-primary via-primary/90 to-primary/80 items-center justify-center p-12 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-accent rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-center text-white max-w-lg">
          <Wrench size={80} className="mx-auto mb-6 opacity-90" />
          <h2 className="mb-4">Gestión Profesional de Servicios</h2>
          <p className="text-lg opacity-90">
            Administra citas, productos, servicios y más para tu taller de mototaxis de manera eficiente y moderna.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="font-bold">500+</p>
              <p className="text-sm opacity-80">Clientes</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="font-bold">1,200+</p>
              <p className="text-sm opacity-80">Servicios</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="font-bold">98%</p>
              <p className="text-sm opacity-80">Satisfacción</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
