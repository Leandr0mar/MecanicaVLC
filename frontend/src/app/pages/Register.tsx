import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { Bike, Mail, Lock, User, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

interface RegisterForm {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  placaMototaxi: string;
  marcaMototaxi: string;
  modeloMototaxi: string;
  password: string;
  confirmPassword: string;
  aceptaTerminos: boolean;
}

const validacionPassword = {
  minLength: (value: string) => value.length >= 8,
  hasUpperCase: (value: string) => /[A-Z]/.test(value),
  hasLowerCase: (value: string) => /[a-z]/.test(value),
  hasNumber: (value: string) => /[0-9]/.test(value),
  hasSpecial: (value: string) => /[!@#$%^&*(),.?":{}|<>]/.test(value),
};

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = watch('password', '');

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);

    try {
      const success = await registerUser({
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        password: data.password,
        telefono: data.telefono,
        direccion: data.direccion,
        placaMototaxi: data.placaMototaxi,
        marcaMototaxi: data.marcaMototaxi,
        modeloMototaxi: data.modeloMototaxi,
      });

      if (success) {
        toast.success('¡Registro exitoso! Por favor inicia sesión.');
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        toast.error('El correo electrónico ya está registrado');
      }
    } catch (error) {
      toast.error('Error al registrar. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const PasswordStrengthIndicator = () => {
    const checks = [
      { label: 'Mínimo 8 caracteres', valid: validacionPassword.minLength(password) },
      { label: 'Una letra mayúscula', valid: validacionPassword.hasUpperCase(password) },
      { label: 'Una letra minúscula', valid: validacionPassword.hasLowerCase(password) },
      { label: 'Un número', valid: validacionPassword.hasNumber(password) },
      { label: 'Un carácter especial', valid: validacionPassword.hasSpecial(password) },
    ];

    const strength = checks.filter((c) => c.valid).length;

    return (
      <div className="mt-2 p-3 bg-muted rounded-lg space-y-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">Seguridad de la contraseña</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`w-8 h-1 rounded-full transition-colors ${
                  level <= strength
                    ? strength <= 2
                      ? 'bg-red-500'
                      : strength <= 3
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                    : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </div>
        {checks.map((check, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            {check.valid ? (
              <CheckCircle2 size={14} className="text-green-500" />
            ) : (
              <AlertCircle size={14} className="text-muted-foreground" />
            )}
            <span className={check.valid ? 'text-green-500' : 'text-muted-foreground'}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    );
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
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-lg">
                <Bike size={32} className="text-accent-foreground" />
              </div>
            </Link>
            <h1 className="mb-2 text-foreground">Crear Cuenta</h1>
            <p className="text-muted-foreground">Únete a VLC Mototaxis</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <User size={18} className="absolute left-3 top-[42px] text-muted-foreground" />
                  <Input
                    label="Nombre completo *"
                    placeholder="Juan Pérez"
                    className="pl-10"
                    error={errors.nombre?.message}
                    {...register('nombre', {
                      required: 'El nombre es requerido',
                      minLength: {
                        value: 3,
                        message: 'Mínimo 3 caracteres',
                      },
                      pattern: {
                        value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                        message: 'Solo letras permitidas',
                      },
                    })}
                  />
                </div>

                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-[42px] text-muted-foreground" />
                  <Input
                    label="Teléfono *"
                    placeholder="+51 987 654 321"
                    className="pl-10"
                    error={errors.telefono?.message}
                    {...register('telefono', {
                      required: 'El teléfono es requerido',
                      pattern: {
                        value: /^[+]?[0-9\s-]{9,15}$/,
                        message: 'Formato de teléfono inválido',
                      },
                    })}
                  />
                </div>
              </div>

              <div className="relative">
                <Mail size={18} className="absolute left-3 top-[42px] text-muted-foreground" />
                <Input
                  label="Correo electrónico *"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <User size={18} className="absolute left-3 top-[42px] text-muted-foreground" />
                  <Input
                    label="Apellido *"
                    placeholder="González"
                    className="pl-10"
                    error={errors.apellido?.message}
                    {...register('apellido', {
                      required: 'El apellido es requerido',
                      minLength: {
                        value: 3,
                        message: 'Mínimo 3 caracteres',
                      },
                      pattern: {
                        value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                        message: 'Solo letras permitidas',
                      },
                    })}
                  />
                </div>

                <div className="relative">
                  <User size={18} className="absolute left-3 top-[42px] text-muted-foreground" />
                  <Input
                    label="Dirección *"
                    placeholder="Av. Principal 123"
                    className="pl-10"
                    error={errors.direccion?.message}
                    {...register('direccion', {
                      required: 'La dirección es requerida',
                      minLength: {
                        value: 5,
                        message: 'Mínimo 5 caracteres',
                      },
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <User size={18} className="absolute left-3 top-[42px] text-muted-foreground" />
                  <Input
                    label="Placa de mototaxi *"
                    placeholder="1234-5A"
                    className="pl-10"
                    error={errors.placaMototaxi?.message}
                    {...register('placaMototaxi', {
                      required: 'La placa es requerida',
                      minLength: {
                        value: 4,
                        message: 'Mínimo 4 caracteres',
                      },
                    })}
                  />
                </div>

                <div className="relative">
                  <User size={18} className="absolute left-3 top-[42px] text-muted-foreground" />
                  <Input
                    label="Marca de mototaxi *"
                    placeholder="Bajaj"
                    className="pl-10"
                    error={errors.marcaMototaxi?.message}
                    {...register('marcaMototaxi', {
                      required: 'La marca es requerida',
                    })}
                  />
                </div>
              </div>

              <div className="relative">
                <User size={18} className="absolute left-3 top-[42px] text-muted-foreground" />
                <Input
                  label="Modelo de mototaxi *"
                  placeholder="RE 4S Chroma"
                  className="pl-10"
                  error={errors.modeloMototaxi?.message}
                  {...register('modeloMototaxi', {
                    required: 'El modelo es requerido',
                  })}
                />
              </div>

              <div className="relative">
                <Lock size={18} className="absolute left-3 top-[42px] text-muted-foreground" />
                <Input
                  label="Contraseña *"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  error={errors.password?.message}
                  onFocus={() => setPasswordFocus(true)}
                  {...register('password', {
                    required: 'La contraseña es requerida',
                    validate: {
                      minLength: (value) => validacionPassword.minLength(value) || 'Mínimo 8 caracteres',
                      hasUpper: (value) => validacionPassword.hasUpperCase(value) || 'Requiere mayúscula',
                      hasLower: (value) => validacionPassword.hasLowerCase(value) || 'Requiere minúscula',
                      hasNumber: (value) => validacionPassword.hasNumber(value) || 'Requiere número',
                      hasSpecial: (value) => validacionPassword.hasSpecial(value) || 'Requiere carácter especial',
                    },
                  })}
                />
                {passwordFocus && password && <PasswordStrengthIndicator />}
              </div>

              <div className="relative">
                <Lock size={18} className="absolute left-3 top-[42px] text-muted-foreground" />
                <Input
                  label="Confirmar contraseña *"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword', {
                    required: 'Confirma tu contraseña',
                    validate: (value) => value === password || 'Las contraseñas no coinciden',
                  })}
                />
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terminos"
                  className="mt-1 rounded accent-accent"
                  {...register('aceptaTerminos', {
                    required: 'Debes aceptar los términos',
                  })}
                />
                <label htmlFor="terminos" className="text-sm text-muted-foreground">
                  Acepto los{' '}
                  <button type="button" className="text-accent hover:text-accent/80 transition-colors">
                    términos y condiciones
                  </button>{' '}
                  y la{' '}
                  <button type="button" className="text-accent hover:text-accent/80 transition-colors">
                    política de privacidad
                  </button>
                </label>
              </div>
              {errors.aceptaTerminos && (
                <p className="text-sm text-destructive">{errors.aceptaTerminos.message}</p>
              )}

              <Button type="submit" variant="accent" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{' '}
                <Link to="/" className="text-accent hover:text-accent/80 transition-colors font-medium">
                  Iniciar sesión
                </Link>
              </div>
            </form>
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
          <User size={80} className="mx-auto mb-6 opacity-90" />
          <h2 className="mb-4">Únete a VLC Mototaxis</h2>
          <p className="text-lg opacity-90 mb-8">
            Crea tu cuenta y accede a nuestros servicios profesionales de mecánica para mototaxis.
          </p>
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <CheckCircle2 size={24} className="text-accent flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Reservas en línea</h4>
                <p className="text-sm opacity-80">Agenda tus citas de manera fácil y rápida</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <CheckCircle2 size={24} className="text-accent flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Seguimiento en tiempo real</h4>
                <p className="text-sm opacity-80">Monitorea el estado de tus servicios</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <CheckCircle2 size={24} className="text-accent flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Atención profesional</h4>
                <p className="text-sm opacity-80">Técnicos certificados y experimentados</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
