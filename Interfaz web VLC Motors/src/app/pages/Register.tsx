import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import {
  Bike,
  Mail,
  Lock,
  User,
  Phone,
  AlertCircle,
  CheckCircle2,
  MapPin,
  CreditCard,
  Gauge,
  Tag,
  ChevronDown,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

interface RegisterForm {
  nombre: string;
  apellido: string;
  dni: string;
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

// Catálogo de marcas y modelos para mototaxis y trimoviles
const CATALOGO_MOTOTAXIS: Record<string, string[]> = {
  Bajaj: [
    'Torito RE 4S (Gasolina / GLP)',
    'Torito RE 205',
    'Torito 2T Clásica',
    'Maxima Z',
    'Maxima Cargo 4T',
  ],
  Honda: [
    'NL 125 Torito',
    'GL 150 Cargo Adaptada',
    'CG 125 Trimóvil',
    'CB 125F Carrozada',
    'Trirueda 150cc Pasajeros',
  ],
  TVS: [
    'King Deluxe Plus',
    'King Duramax 225',
    'King Kargo 225',
    'King FI 225cc',
    'King GS Monocilíndrico',
  ],
  Ronco: [
    'Pantera 200 Pasajeros',
    'Demoledor 250',
    'Titán 200cc',
    'Centauro 200',
    'Furia 250 Carguero',
  ],
  Ssenda: [
    'Matrix 200 Pasajeros',
    'Forzudo 250',
    'Inka 200cc',
    'Titanium 200',
    'Max Cargo 250 Especial',
  ],
  Wanxin: [
    'WX200ZH Torito Pasajero',
    'WX150ZH Urbana',
    'WX250ZH Rey León',
    'WX200 Super Pasajeros',
    'WX150 Furgón Cerrado',
  ],
  Zongshen: [
    'ZS200ZH-A Pasajeros',
    'ZS250ZH King',
    'ZS150ZH Pasajero Clásico',
    'Ares 200',
    'Hércules 250 Furgón',
  ],
  Camax: [
    'CM200ZH Pasajero Confort',
    'CM250ZH Fuerza',
    'CM150 Clásica',
    'Camax Fénix 200',
    'Camax Titán 250 Carguero',
  ],
};

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
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const password = watch('password', '');
  const marcaSeleccionada = watch('marcaMototaxi', '');
  const modelosDisponibles = marcaSeleccionada ? CATALOGO_MOTOTAXIS[marcaSeleccionada] || [] : [];

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);

    try {
      const success = await registerUser({
        nombre: data.nombre.trim(),
        apellido: data.apellido.trim(),
        dni: data.dni.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        telefono: data.telefono.trim(),
        direccion: data.direccion.trim(),
        placaMototaxi: data.placaMototaxi.trim().toUpperCase(),
        marcaMototaxi: data.marcaMototaxi,
        modeloMototaxi: data.modeloMototaxi,
      });

      if (success) {
        toast.success('¡Registro exitoso! Redirigiendo al inicio...');
        setTimeout(() => {
          navigate('/');
        }, 1200);
      } else {
        toast.error('El DNI o correo electrónico ya está registrado.');
      }
    } catch {
      toast.error('Ocurrió un error al procesar el registro. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const PasswordStrengthIndicator = () => {
    const checks = [
      { label: 'Mínimo 8 caracteres', valid: validacionPassword.minLength(password) },
      { label: 'Una mayúscula', valid: validacionPassword.hasUpperCase(password) },
      { label: 'Una minúscula', valid: validacionPassword.hasLowerCase(password) },
      { label: 'Al menos un número', valid: validacionPassword.hasNumber(password) },
      { label: 'Un carácter especial (@, #, $, etc.)', valid: validacionPassword.hasSpecial(password) },
    ];

    const strength = checks.filter((c) => c.valid).length;

    return (
      <div className="mt-2 p-3 bg-muted/60 border border-border rounded-xl space-y-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground font-medium">Seguridad de la contraseña</span>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`w-7 h-1.5 rounded-full transition-all duration-300 ${
                  level <= strength
                    ? strength <= 2
                      ? 'bg-destructive'
                      : strength <= 3
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    : 'bg-muted-foreground/20'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
          {checks.map((check, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-xs">
              {check.valid ? (
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
              ) : (
                <AlertCircle size={13} className="text-muted-foreground shrink-0" />
              )}
              <span className={check.valid ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground'}>
                {check.label}
              </span>
            </div>
          ))}
        </div>
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
        className="flex-1 flex items-center justify-center p-6 md:p-10"
      >
        <div className="w-full max-w-2xl">
          <div className="mb-6 text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-lg">
                <Bike size={28} className="text-accent-foreground" />
              </div>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Crear Cuenta de Conductor</h1>
            <p className="text-sm text-muted-foreground">Únete a VLC Mototaxis para gestionar tu unidad</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              
              {/* Sección 1: Datos Personales */}
              <div>
                <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">
                  Datos del Conductor
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-[42px] text-muted-foreground" />
                      <Input
                        label="Nombres *"
                        placeholder="Juan Carlos"
                        className="pl-10"
                        error={errors.nombre?.message}
                        {...register('nombre', {
                          required: 'Ingresa tus nombres',
                          minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                          maxLength: { value: 100, message: 'Máximo 100 caracteres permitidos' },
                          pattern: {
                            value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                            message: 'Solo se permiten letras',
                          },
                        })}
                      />
                    </div>

                    <div className="relative">
                      <User size={18} className="absolute left-3 top-[42px] text-muted-foreground" />
                      <Input
                        label="Apellidos *"
                        placeholder="Pérez Ramos"
                        className="pl-10"
                        error={errors.apellido?.message}
                        {...register('apellido', {
                          required: 'Ingresa tus apellidos',
                          minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                          maxLength: { value: 100, message: 'Máximo 100 caracteres permitidos' },
                          pattern: {
                            value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                            message: 'Solo se permiten letras',
                          },
                        })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <CreditCard size={18} className="absolute left-3 top-[42px] text-muted-foreground" />
                      <Input
                        label="DNI *"
                        placeholder="12345678"
                        inputMode="numeric"
                        maxLength={8}
                        className="pl-10"
                        error={errors.dni?.message}
                        {...register('dni', {
                          required: 'El DNI es obligatorio',
                          pattern: {
                            value: /^\d{8}$/,
                            message: 'Debe tener exactamente 8 dígitos numéricos',
                          },
                        })}
                      />
                    </div>

                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-[42px] text-muted-foreground" />
                      <Input
                        label="Teléfono / Celular *"
                        placeholder="987654321"
                        inputMode="tel"
                        maxLength={12}
                        className="pl-10"
                        error={errors.telefono?.message}
                        {...register('telefono', {
                          required: 'El número de teléfono es obligatorio',
                          pattern: {
                            value: /^(?:\+51|51)?\s?9\d{8}$/,
                            message: 'Ingresa un número celular válido (ej. 987654321)',
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
                      placeholder="conductor@ejemplo.com"
                      className="pl-10"
                      error={errors.email?.message}
                      {...register('email', {
                        required: 'El correo electrónico es obligatorio',
                        maxLength: { value: 100, message: 'El correo excede el límite permitido' },
                        pattern: {
                          value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                          message: 'Formato de correo inválido (ejemplo@correo.com)',
                        },
                      })}
                    />
                  </div>

                  <div className="relative">
                    <MapPin size={18} className="absolute left-3 top-[42px] text-muted-foreground" />
                    <Input
                      label="Dirección *"
                      placeholder="Av. Pachacútec 1024, Villa El Salvador"
                      className="pl-10"
                      error={errors.direccion?.message}
                      {...register('direccion', {
                        required: 'La dirección es obligatoria',
                        minLength: { value: 5, message: 'La dirección debe tener al menos 5 caracteres' },
                        maxLength: { value: 150, message: 'Máximo 150 caracteres permitidos' },
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Sección 2: Datos de la Mototaxi */}
              <div className="pt-2 border-t border-border">
                <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">
                  Datos de la Unidad
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Placa */}
                  <div className="relative">
                    <Tag size={18} className="absolute left-3 top-[42px] text-muted-foreground pointer-events-none" />
                    <Input
                      label="Placa *"
                      placeholder="1234-5A"
                      className="pl-10 uppercase"
                      maxLength={8}
                      error={errors.placaMototaxi?.message}
                      {...register('placaMototaxi', {
                        required: 'La placa es obligatoria',
                        pattern: {
                          value: /^[A-Z0-9]{3,4}-?[A-Z0-9]{2,3}$/i,
                          message: 'Formato inválido (ej. 1234-5B)',
                        },
                      })}
                    />
                  </div>

                  {/* Combobox Marca */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="marcaMototaxi" className="text-sm font-medium text-foreground">
                      Marca *
                    </label>
                    <div className="relative">
                      <Bike size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <select
                        id="marcaMototaxi"
                        className={`w-full h-10 pl-10 pr-9 rounded-md border bg-background text-sm text-foreground transition-colors appearance-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                          errors.marcaMototaxi ? 'border-destructive focus-visible:ring-destructive' : 'border-input'
                        }`}
                        {...register('marcaMototaxi', {
                          required: 'Selecciona la marca de tu mototaxi',
                          onChange: () => {
                            // Limpia y revalida el modelo al cambiar de marca
                            setValue('modeloMototaxi', '', { shouldValidate: true });
                          },
                        })}
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Selecciona una marca
                        </option>
                        {Object.keys(CATALOGO_MOTOTAXIS).map((marca) => (
                          <option key={marca} value={marca}>
                            {marca}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none opacity-60" />
                    </div>
                    {errors.marcaMototaxi && (
                      <p className="text-xs text-destructive flex items-center gap-1 mt-0.5">
                        <AlertCircle size={12} />
                        {errors.marcaMototaxi.message}
                      </p>
                    )}
                  </div>

                  {/* Combobox Modelo (Dependiente) */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="modeloMototaxi" className="text-sm font-medium text-foreground">
                      Modelo *
                    </label>
                    <div className="relative">
                      <Gauge size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <select
                        id="modeloMototaxi"
                        disabled={!marcaSeleccionada}
                        className={`w-full h-10 pl-10 pr-9 rounded-md border bg-background text-sm text-foreground transition-colors appearance-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50 ${
                          errors.modeloMototaxi ? 'border-destructive focus-visible:ring-destructive' : 'border-input'
                        }`}
                        {...register('modeloMototaxi', {
                          required: 'Selecciona el modelo de tu vehículo',
                        })}
                        defaultValue=""
                      >
                        <option value="" disabled>
                          {marcaSeleccionada ? 'Selecciona un modelo' : 'Primero elige la marca'}
                        </option>
                        {modelosDisponibles.map((modelo) => (
                          <option key={modelo} value={modelo}>
                            {modelo}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none opacity-60" />
                    </div>
                    {errors.modeloMototaxi && (
                      <p className="text-xs text-destructive flex items-center gap-1 mt-0.5">
                        <AlertCircle size={12} />
                        {errors.modeloMototaxi.message}
                      </p>
                    )}
                  </div>

                </div>
              </div>

              {/* Sección 3: Credenciales de Acceso */}
              <div className="pt-2 border-t border-border">
                <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">
                  Seguridad
                </h3>
                <div className="space-y-4">
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
                        required: 'Ingresa una contraseña',
                        validate: {
                          minLength: (v) => validacionPassword.minLength(v) || 'Mínimo 8 caracteres',
                          hasUpper: (v) => validacionPassword.hasUpperCase(v) || 'Falta una letra mayúscula',
                          hasLower: (v) => validacionPassword.hasLowerCase(v) || 'Falta una letra minúscula',
                          hasNumber: (v) => validacionPassword.hasNumber(v) || 'Falta al menos un número',
                          hasSpecial: (v) => validacionPassword.hasSpecial(v) || 'Falta un símbolo especial',
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
                </div>
              </div>

              {/* Términos y Condiciones */}
              <div className="pt-1">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terminos"
                    className="mt-1 h-4 w-4 rounded border-border accent-accent cursor-pointer"
                    {...register('aceptaTerminos', {
                      required: 'Debes aceptar los términos y condiciones',
                    })}
                  />
                  <label htmlFor="terminos" className="text-xs md:text-sm text-muted-foreground cursor-pointer leading-relaxed">
                    Acepto los{' '}
                    <button type="button" className="text-accent hover:underline font-medium">
                      términos y condiciones
                    </button>{' '}
                    y la{' '}
                    <button type="button" className="text-accent hover:underline font-medium">
                      política de privacidad
                    </button>
                    .
                  </label>
                </div>
                {errors.aceptaTerminos && (
                  <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                    <AlertCircle size={13} />
                    {errors.aceptaTerminos.message}
                  </p>
                )}
              </div>

              {/* Botón de Enviar */}
              <Button
                type="submit"
                variant="accent"
                className="w-full font-semibold text-base py-5 shadow-md transition-all duration-200"
                size="lg"
                disabled={loading}
              >
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Button>

              <div className="text-center text-sm text-muted-foreground pt-1">
                ¿Ya tienes una cuenta registrada?{' '}
                <Link to="/" className="text-accent hover:underline font-medium">
                  Inicia sesión aquí
                </Link>
              </div>
            </form>
          </div>
        </div>
      </motion.div>

      {/* Lateral Informativo */}
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
          <Bike size={80} className="mx-auto mb-6 opacity-90 text-accent" />
          <h2 className="text-2xl font-bold mb-3">Únete a VLC Mototaxis</h2>
          <p className="text-sm opacity-90 mb-8 leading-relaxed">
            Registra tu unidad para coordinar revisiones técnicas, afinamientos y reparaciones con mecánicos especializados.
          </p>
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <CheckCircle2 size={22} className="text-accent shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Reserva de citas sin esperas</h4>
                <p className="text-xs opacity-80">Elige fecha, turno y servicio mecánico desde cualquier dispositivo.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <CheckCircle2 size={22} className="text-accent shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Historial de mantenimiento</h4>
                <p className="text-xs opacity-80">Revisa repuestos cambiados, diagnósticos previos y estados de servicio.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <CheckCircle2 size={22} className="text-accent shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Mecánicos especializados</h4>
                <p className="text-xs opacity-80">Atención certificada en marcas líderes como Bajaj Torito, TVS King y Piaggio.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};