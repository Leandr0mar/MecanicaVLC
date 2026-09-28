import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Plus,
  Trash2,
  User,
  Shield,
  Wrench,
  Filter,
  Edit2,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';
import { API_URL } from '../../context/AuthContext';

// Catálogo vehicular
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

interface UsuarioFormData {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  contrasenia?: string;
  rol: number;
  telefono?: string;
  direccion?: string;
  placaMototaxi?: string;
  marcaMototaxi?: string;
  modeloMototaxi?: string;
  especialidad?: string;
  disponibilidad?: boolean;
}

export const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<any | null>(null);

  // Filtro de rol en tabla: 1=Admin, 2=Trabajador, 3=Cliente, 'todos'=Sin filtro
  const [filtroActivo, setFiltroActivo] = useState<number | 'todos'>('todos');

  // Configuración de validación profesional
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UsuarioFormData>({
    mode: 'onBlur',             // Valida cuando el usuario termina de escribir y sale del campo
    reValidateMode: 'onChange', // Limpia el error al instante en cuanto se corrige
    defaultValues: {
      rol: 3,
      disponibilidad: true,
    },
  });

  const rolSeleccionado = Number(watch('rol', 3));
  const marcaSeleccionada = watch('marcaMototaxi', '');
  const modelosDisponibles = marcaSeleccionada ? CATALOGO_MOTOTAXIS[marcaSeleccionada] || [] : [];

  useEffect(() => {
    cargarUsuarios();
    const intervalo = window.setInterval(() => cargarUsuarios(false), 15_000);
    return () => window.clearInterval(intervalo);
  }, []);

  const cargarUsuarios = async (mostrarCarga = true) => {
    try {
      if (mostrarCarga) setLoading(true);
      const res = await fetch(`${API_URL}/api/usuarios`, { credentials: 'include' });
      if (res.status === 401) {
        window.location.href = '/iniciar-sesion';
        return;
      }
      if (!res.ok) throw new Error('Error al cargar');
      setUsuarios(await res.json());
    } catch {
      toast.error('Error al cargar la lista de usuarios');
    } finally {
      if (mostrarCarga) setLoading(false);
    }
  };

  const eliminarUsuario = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/usuarios/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.status === 401) return (window.location.href = '/iniciar-sesion');
      if (!res.ok) throw new Error('Error');
      await cargarUsuarios();
      toast.success('Usuario eliminado exitosamente');
    } catch {
      toast.error('No se pudo eliminar el usuario. Verifique dependencias activas.');
    }
  };

  const abrirModal = (usuario?: any) => {
    setUsuarioEditando(usuario ?? null);

    // Precarga o limpia el formulario con react-hook-form
    reset({
      nombre: usuario?.nombre ?? '',
      apellido: usuario?.apellido ?? '',
      dni: usuario?.dni ?? '',
      email: usuario?.email ?? '',
      contrasenia: '',
      rol: usuario?.rol ?? 3,
      telefono: usuario?.telefono ?? '',
      direccion: usuario?.direccion ?? '',
      placaMototaxi: usuario?.placaMototaxi ?? '',
      marcaMototaxi: usuario?.marcaMototaxi ?? '',
      modeloMototaxi: usuario?.modeloMototaxi ?? '',
      especialidad: usuario?.especialidad ?? '',
      disponibilidad: usuario?.disponibilidad ?? true,
    });

    setModalAbierto(true);
  };

  const onSubmit = async (data: UsuarioFormData) => {
    setGuardando(true);
    try {
      let endpoint = '';
      if (data.rol === 1) endpoint = '/api/usuarios/admin';
      if (data.rol === 2) endpoint = '/api/usuarios/trabajador';
      if (data.rol === 3) endpoint = '/api/usuarios/cliente';

      const payload = usuarioEditando
        ? {
            nombre: data.nombre.trim(),
            apellido: data.apellido.trim(),
            dni: data.dni.trim(),
            email: data.email.trim().toLowerCase(),
            ...(data.rol === 3 && {
              telefono: data.telefono?.trim(),
              direccion: data.direccion?.trim(),
              placaMototaxi: data.placaMototaxi?.trim().toUpperCase(),
              marcaMototaxi: data.marcaMototaxi,
              modeloMototaxi: data.modeloMototaxi,
            }),
            ...(data.rol === 2 && {
              especialidad: data.especialidad?.trim(),
              disponibilidad: data.disponibilidad,
            }),
          }
        : {
            ...data,
            nombre: data.nombre.trim(),
            apellido: data.apellido.trim(),
            dni: data.dni.trim(),
            email: data.email.trim().toLowerCase(),
            placaMototaxi: data.placaMototaxi?.trim().toUpperCase(),
          };

      const url = usuarioEditando
        ? `${API_URL}/api/usuarios/${usuarioEditando.idUsuario}`
        : `${API_URL}${endpoint}`;

      const res = await fetch(url, {
        method: usuarioEditando ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.status === 401) return (window.location.href = '/iniciar-sesion');
      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        throw new Error(errorBody?.error || 'No se pudieron guardar los datos');
      }

      await cargarUsuarios();
      toast.success(
        usuarioEditando ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente'
      );
      setModalAbierto(false);
      setUsuarioEditando(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al procesar la solicitud');
    } finally {
      setGuardando(false);
    }
  };

  const getRolUI = (rolId: number) => {
    if (rolId === 1)
      return {
        text: 'Admin',
        icon: <Shield size={20} className="text-amber-700 dark:text-accent" />,
        badge: 'bg-amber-100 text-amber-800 dark:bg-accent/20 dark:text-accent',
      };
    if (rolId === 2)
      return {
        text: 'Trabajador',
        icon: <Wrench size={20} className="text-green-700 dark:text-green-500" />,
        badge: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400',
      };
    return {
      text: 'Cliente',
      icon: <User size={20} className="text-blue-700 dark:text-blue-500" />,
      badge: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400',
    };
  };

  const usuariosFiltrados = usuarios.filter((usuario) => {
    if (filtroActivo === 'todos') return true;
    return usuario.rol === filtroActivo;
  });

  return (
    <div className="space-y-6">
      {/* Cabecera y Filtros */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="mb-2 text-foreground font-bold text-2xl">Gestión de Usuarios</h2>
          <p className="text-muted-foreground text-sm">
            Control de accesos y perfiles de clientes, mecánicos y administradores
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-card border border-border p-1 rounded-lg">
            <Button
              variant={filtroActivo === 'todos' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFiltroActivo('todos')}
              className="text-xs"
            >
              Todos
            </Button>
            <Button
              variant={filtroActivo === 1 ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFiltroActivo(1)}
              className="text-xs gap-1"
            >
              <Shield size={14} /> Admins
            </Button>
            <Button
              variant={filtroActivo === 2 ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFiltroActivo(2)}
              className="text-xs gap-1"
            >
              <Wrench size={14} /> Trabajadores
            </Button>
            <Button
              variant={filtroActivo === 3 ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFiltroActivo(3)}
              className="text-xs gap-1"
            >
              <User size={14} /> Clientes
            </Button>
          </div>

          <Button variant="accent" onClick={() => abrirModal()} className="gap-2">
            <Plus size={18} />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground p-8">Cargando usuarios...</div>
      ) : usuariosFiltrados.length === 0 ? (
        <div className="text-center text-muted-foreground p-12 bg-card border border-border rounded-xl">
          <Filter size={40} className="mx-auto mb-3 opacity-20" />
          <p>No se encontraron usuarios para este filtro.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {usuariosFiltrados.map((usuario) => {
            const ui = getRolUI(usuario.rol);
            return (
              <Card key={usuario.idUsuario} hover>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        {ui.icon}
                      </div>
                      <div>
                        <h4 className="text-card-foreground font-semibold line-clamp-1">
                          {usuario.nombre} {usuario.apellido}
                        </h4>
                        <p className="text-xs text-muted-foreground">{usuario.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Registro: {usuario.fechaRegistro
                            ? new Date(usuario.fechaRegistro).toLocaleDateString('es-PE')
                            : 'Sin fecha'}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span
                            className={`h-2 w-2 rounded-full ${usuario.conectado ? 'bg-emerald-500' : 'bg-muted-foreground/50'}`}
                            aria-hidden="true"
                          />
                          <span className={`text-xs ${usuario.conectado ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                            {usuario.conectado ? 'Conectado' : 'Desconectado'}
                          </span>
                        </div>
                        {usuario.ultimaActividad && (
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            Última actividad: {new Date(usuario.ultimaActividad).toLocaleString('es-PE', {
                              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 mb-4">
                    {usuario.rol === 3 && (
                      <>
                        <p className="text-xs text-muted-foreground">
                          Teléfono: {usuario.telefono || 'Sin registrar'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Dirección: {usuario.direccion || 'Sin registrar'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Unidad: {usuario.marcaMototaxi || '-'} {usuario.modeloMototaxi || '-'}{' '}
                          ({usuario.placaMototaxi || 'Sin placa'})
                        </p>
                      </>
                    )}
                    {usuario.rol === 2 && (
                      <>
                        <p className="text-xs text-muted-foreground">
                          Especialidad: {usuario.especialidad || 'Sin registrar'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Disponibilidad: {usuario.disponibilidad ? 'Disponible' : 'No disponible'}
                        </p>
                      </>
                    )}
                    {usuario.rol === 1 && (
                      <p className="text-xs text-muted-foreground">
                        Nivel de acceso: {usuario.nivelAcceso ?? 'Sin asignar'}
                      </p>
                    )}

                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${ui.badge}`}
                    >
                      {ui.text}
                    </span>
                  </div>

                  <div className="flex justify-end mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      title="Editar usuario"
                      aria-label={`Editar a ${usuario.nombre} ${usuario.apellido}`}
                      onClick={() => abrirModal(usuario)}
                      className="mr-2"
                    >
                      <Edit2 size={14} />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => eliminarUsuario(usuario.idUsuario)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal con validación profesional onBlur / onChange */}
      <Dialog.Root open={modalAbierto} onOpenChange={setModalAbierto}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <Dialog.Title className="mb-6 text-card-foreground text-xl font-bold">
              {usuarioEditando ? 'Editar Usuario' : 'Nuevo Usuario'}
            </Dialog.Title>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              
              {/* Nombres y Apellidos */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Nombre *"
                  placeholder="Juan"
                  error={errors.nombre?.message}
                  {...register('nombre', {
                    required: 'El nombre es obligatorio',
                    minLength: { value: 2, message: 'Mínimo 2 letras' },
                    maxLength: { value: 100, message: 'Máximo 100 caracteres' },
                    pattern: {
                      value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                      message: 'Solo se permiten letras',
                    },
                  })}
                />
                <Input
                  label="Apellido *"
                  placeholder="Pérez"
                  error={errors.apellido?.message}
                  {...register('apellido', {
                    required: 'El apellido es obligatorio',
                    minLength: { value: 2, message: 'Mínimo 2 letras' },
                    maxLength: { value: 100, message: 'Máximo 100 caracteres' },
                    pattern: {
                      value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                      message: 'Solo se permiten letras',
                    },
                  })}
                />
              </div>

              {/* DNI */}
              <Input
                label="DNI *"
                placeholder="12345678"
                inputMode="numeric"
                maxLength={8}
                error={errors.dni?.message}
                {...register('dni', {
                  required: 'El DNI es obligatorio',
                  pattern: {
                    value: /^\d{8}$/,
                    message: 'Debe tener exactamente 8 dígitos numéricos',
                  },
                })}
              />

              {/* Email */}
              <Input
                label="Correo electrónico *"
                type="email"
                placeholder="usuario@vlc.com"
                error={errors.email?.message}
                {...register('email', {
                  required: 'El correo electrónico es obligatorio',
                  maxLength: { value: 100, message: 'Máximo 100 caracteres' },
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: 'Formato de correo inválido',
                  },
                })}
              />

              {/* Contraseña (Solo exigida si es creación) */}
              {!usuarioEditando && (
                <Input
                  label="Contraseña inicial *"
                  type="password"
                  placeholder="••••••••"
                  error={errors.contrasenia?.message}
                  {...register('contrasenia', {
                    required: 'La contraseña inicial es requerida',
                    minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                  })}
                />
              )}

              {/* Rol (Solo modificable al crear para evitar desajustes relacionales) */}
              {!usuarioEditando && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="rol" className="text-sm font-medium text-foreground">
                    Asignar Rol
                  </label>
                  <select
                    id="rol"
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                    {...register('rol', { valueAsNumber: true })}
                  >
                    <option value={3}>Cliente (Acceso a citas y mototaxi)</option>
                    <option value={2}>Trabajador (Agenda operativa)</option>
                    <option value={1}>Administrador (Control total)</option>
                  </select>
                </div>
              )}

              {/* Sub-formulario Cliente (Rol 3) */}
              {rolSeleccionado === 3 && (
                <div className="p-4 bg-muted/40 rounded-xl space-y-4 border border-border">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                    Datos del Cliente y Unidad
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Teléfono"
                      placeholder="987654321"
                      inputMode="tel"
                      maxLength={12}
                      error={errors.telefono?.message}
                      {...register('telefono', {
                        pattern: {
                          value: /^(?:\+51|51)?\s?9\d{8}$/,
                          message: 'Celular inválido (ej. 987654321)',
                        },
                      })}
                    />
                    <Input
                      label="Placa *"
                      placeholder="1234-5A"
                      className="uppercase"
                      maxLength={8}
                      error={errors.placaMototaxi?.message}
                      {...register('placaMototaxi', {
                        required: 'La placa es obligatoria',
                        pattern: {
                          value: /^[A-Z0-9]{3,4}-?[A-Z0-9]{2,3}$/i,
                          message: 'Formato de placa inválido',
                        },
                      })}
                    />
                  </div>

                  <Input
                    label="Dirección"
                    placeholder="Av. Principal 123"
                    error={errors.direccion?.message}
                    {...register('direccion', {
                      minLength: { value: 5, message: 'Mínimo 5 caracteres' },
                      maxLength: { value: 150, message: 'Máximo 150 caracteres' },
                    })}
                  />

                  {/* Selectores dinámicos en cascada */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="marcaMototaxi" className="text-sm font-medium text-foreground">
                        Marca *
                      </label>
                      <div className="relative">
                        <select
                          id="marcaMototaxi"
                          className={`w-full px-4 py-2.5 bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer text-sm ${
                            errors.marcaMototaxi ? 'border-destructive' : 'border-input'
                          }`}
                          {...register('marcaMototaxi', {
                            required: 'Selecciona una marca',
                            onChange: () => {
                              setValue('modeloMototaxi', '', { shouldValidate: true });
                            },
                          })}
                        >
                          <option value="">Selecciona marca</option>
                          {Object.keys(CATALOGO_MOTOTAXIS).map((marca) => (
                            <option key={marca} value={marca}>
                              {marca}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={16}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none opacity-60"
                        />
                      </div>
                      {errors.marcaMototaxi && (
                        <p className="text-xs text-destructive flex items-center gap-1 mt-0.5">
                          <AlertCircle size={12} />
                          {errors.marcaMototaxi.message}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="modeloMototaxi" className="text-sm font-medium text-foreground">
                        Modelo *
                      </label>
                      <div className="relative">
                        <select
                          id="modeloMototaxi"
                          disabled={!marcaSeleccionada}
                          className={`w-full px-4 py-2.5 bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer text-sm disabled:cursor-not-allowed disabled:opacity-50 ${
                            errors.modeloMototaxi ? 'border-destructive' : 'border-input'
                          }`}
                          {...register('modeloMototaxi', {
                            required: 'Selecciona un modelo',
                          })}
                        >
                          <option value="">
                            {marcaSeleccionada ? 'Selecciona modelo' : 'Elige marca primero'}
                          </option>
                          {modelosDisponibles.map((modelo) => (
                            <option key={modelo} value={modelo}>
                              {modelo}
                            </option>
                          ))}
                          {/* Preserva modelo si existía previamente fuera del catálogo */}
                          {watch('modeloMototaxi') &&
                            !modelosDisponibles.includes(watch('modeloMototaxi') || '') && (
                              <option value={watch('modeloMototaxi')}>
                                {watch('modeloMototaxi')} (Actual)
                              </option>
                            )}
                        </select>
                        <ChevronDown
                          size={16}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none opacity-60"
                        />
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
              )}

              {/* Sub-formulario Trabajador (Rol 2) */}
              {rolSeleccionado === 2 && (
                <div className="p-4 bg-muted/40 rounded-xl space-y-4 border border-border">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                    Datos Laborales
                  </h4>
                  <Input
                    label="Especialidad *"
                    placeholder="Motor, Sistema Eléctrico, Frenos..."
                    error={errors.especialidad?.message}
                    {...register('especialidad', {
                      required: 'Indica la especialidad técnica',
                      minLength: { value: 3, message: 'Mínimo 3 caracteres' },
                    })}
                  />
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="disponibilidad" className="text-sm font-medium text-foreground">
                      Disponibilidad Operativa
                    </label>
                    <select
                      id="disponibilidad"
                      className="w-full px-4 py-2.5 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                      {...register('disponibilidad', {
                        setValueAs: (v) => v === 'true' || v === true,
                      })}
                    >
                      <option value="true">Disponible para asignación</option>
                      <option value="false">No disponible / De turno</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setModalAbierto(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  className="flex-1"
                  disabled={guardando}
                >
                  {guardando
                    ? 'Procesando...'
                    : usuarioEditando
                    ? 'Actualizar Usuario'
                    : 'Guardar Usuario'}
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};