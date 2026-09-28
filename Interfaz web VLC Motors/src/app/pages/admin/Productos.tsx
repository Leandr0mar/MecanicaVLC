import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/ui/button';
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  Filter,
  Download,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';
import { Input } from '../../components/ui/input';
import { formatCurrency } from '../../utils/currency';
import { API_URL } from '../../context/AuthContext';
import * as XLSX from 'xlsx';

interface ProductoFormData {
  nombre: string;
  codigoProducto: string;
  marca: string;
  precioVenta: number;
  stock: number;
  imagenUrl?: string;
  idCategoria: number;
  idProveedor: number;
  idOferta?: number;
}

export const Productos = () => {
  const [productos, setProductos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [ofertas, setOfertas] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState<any | null>(null);

  // Estados para filtros en tabla
  const [filtroCategoria, setFiltroCategoria] = useState<number | 'TODAS'>('TODAS');
  const [filtroMarca, setFiltroMarca] = useState<string | 'TODAS'>('TODAS');
  const [filtroProveedor, setFiltroProveedor] = useState<number | 'TODOS'>('TODOS');
  const [filtroStock, setFiltroStock] = useState<string | 'TODOS'>('TODOS');

  // React Hook Form con estrategia profesional onBlur + onChange
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductoFormData>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      nombre: '',
      codigoProducto: '',
      marca: '',
      precioVenta: 0,
      stock: 0,
      imagenUrl: '',
      idCategoria: 0,
      idProveedor: 0,
      idOferta: 0,
    },
  });

  const imagenUrlWatch = watch('imagenUrl', '');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resProd, resCat, resProv, resOf] = await Promise.all([
        fetch(`${API_URL}/api/productos`, { credentials: 'include' }),
        fetch(`${API_URL}/api/categorias`, { credentials: 'include' }),
        fetch(`${API_URL}/api/proveedores`, { credentials: 'include' }),
        fetch(`${API_URL}/api/ofertas`, { credentials: 'include' }),
      ]);

      if (resProd.status === 401) {
        toast.error('Tu sesión ha expirado');
        window.location.href = '/iniciar-sesion';
        return;
      }

      if (resProd.ok) setProductos(await resProd.json());
      if (resCat.ok) setCategorias(await resCat.json());
      if (resProv.ok) setProveedores(await resProv.json());
      if (resOf.ok) setOfertas(await resOf.json());
    } catch {
      toast.error('Error al cargar la información del inventario');
    } finally {
      setLoading(false);
    }
  };

  const eliminar = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/productos/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.status === 401) {
        window.location.href = '/iniciar-sesion';
        return;
      }
      if (!res.ok) throw new Error('Error al eliminar');
      await cargarDatos();
      toast.success('Producto eliminado del inventario');
    } catch {
      toast.error('No se pudo eliminar el producto. Verifique dependencias activas.');
    }
  };

  const abrirModal = (producto?: any) => {
    setProductoEditando(producto ?? null);
    reset({
      nombre: producto?.nombre ?? '',
      codigoProducto: producto?.codigoProducto ?? '',
      marca: producto?.marca ?? '',
      precioVenta: producto?.precioVenta ?? 0,
      stock: producto?.stock ?? 0,
      imagenUrl: producto?.imagenUrl ?? '',
      idCategoria: producto?.categoria?.idCategoria ?? 0,
      idProveedor: producto?.proveedor?.idProveedor ?? 0,
      idOferta: producto?.oferta?.idOferta ?? 0,
    });
    setModalAbierto(true);
  };

  const onSubmit = async (data: ProductoFormData) => {
    setGuardando(true);

    const payload = {
      nombre: data.nombre.trim(),
      codigoProducto: data.codigoProducto.trim().toUpperCase(),
      marca: data.marca.trim(),
      precioVenta: Number(data.precioVenta),
      stock: Number(data.stock),
      imagenUrl: data.imagenUrl?.trim() || null,
      categoria: { idCategoria: Number(data.idCategoria) },
      proveedor: { idProveedor: Number(data.idProveedor) },
      oferta: Number(data.idOferta) > 0 ? { idOferta: Number(data.idOferta) } : null,
    };

    try {
      const url = productoEditando
        ? `${API_URL}/api/productos/${productoEditando.idProducto}`
        : `${API_URL}/api/productos`;
      const method = productoEditando ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        window.location.href = '/iniciar-sesion';
        return;
      }

      if (!res.ok) {
        const errorDetail = await res.json().catch(() => null);
        throw new Error(errorDetail?.error || 'Verifica que el código SKU no esté duplicado');
      }

      await cargarDatos();
      toast.success(productoEditando ? 'Producto actualizado correctamente' : 'Producto registrado en inventario');
      setModalAbierto(false);
      setProductoEditando(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar el producto');
    } finally {
      setGuardando(false);
    }
  };

  // Filtrado de tabla
  const marcasUnicas = Array.from(new Set(productos.map((p) => p.marca))).filter(Boolean).sort();

  const productosFiltrados = productos.filter((producto) => {
    const cumpleCategoria = filtroCategoria === 'TODAS' || producto.categoria?.idCategoria === filtroCategoria;
    const cumpleMarca = filtroMarca === 'TODAS' || producto.marca === filtroMarca;
    const cumpleProveedor = filtroProveedor === 'TODOS' || producto.proveedor?.idProveedor === filtroProveedor;

    let cumpleStock = true;
    if (filtroStock === 'AGOTADO') cumpleStock = producto.stock === 0;
    else if (filtroStock === 'POCO_STOCK') cumpleStock = producto.stock > 0 && producto.stock <= 5;
    else if (filtroStock === 'EN_STOCK') cumpleStock = producto.stock > 5;

    return cumpleCategoria && cumpleMarca && cumpleProveedor && cumpleStock;
  });

  // Exportar Excel
  const exportarExcel = () => {
    if (productosFiltrados.length === 0) {
      return toast.error('No hay productos bajo este filtro para exportar');
    }

    const datosExcel = productosFiltrados.map((p) => {
      const precioCalculado = p.precioFinal && p.precioFinal < p.precioVenta ? p.precioFinal : p.precioVenta;
      const estadoStock = p.stock > 10 ? 'Disponible' : p.stock > 0 ? 'Poco stock' : 'Agotado';

      return {
        'Código (SKU)': p.codigoProducto,
        'Producto': p.nombre,
        'Marca': p.marca,
        'Categoría': p.categoria?.nombreCategoria || 'Sin categoría',
        'Proveedor': p.proveedor?.nombreProveedor || 'Sin proveedor',
        'Precio Base (S/.)': p.precioVenta,
        'Precio Final (S/.)': precioCalculado,
        'Oferta Activa': p.oferta?.titulo || 'Ninguna',
        'Stock Actual': p.stock,
        'Estado Inventario': estadoStock,
      };
    });


    const worksheet = XLSX.utils.json_to_sheet(datosExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario');

    worksheet['!cols'] = [
      { wch: 15 },
      { wch: 35 },
      { wch: 15 },
      { wch: 20 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 12 },
      { wch: 18 },
    ];

    XLSX.writeFile(workbook, `Reporte_Inventario_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Reporte Excel generado exitosamente');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="mb-2 text-foreground font-bold text-2xl">Inventario de Repuestos</h2>
          <p className="text-muted-foreground text-sm">Gestiona repuestos, precios y existencias para mototaxis</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={exportarExcel}
            className="gap-2 bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600/20 dark:text-emerald-400 border border-emerald-600/20"
          >
            <Download size={18} />
            Exportar Excel
          </Button>
          <Button variant="accent" onClick={() => abrirModal()} className="gap-2">
            <Plus size={18} />
            Nuevo Producto
          </Button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-card border border-border p-4 rounded-xl flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs mb-1 text-muted-foreground font-medium">Categoría</label>
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value === 'TODAS' ? 'TODAS' : Number(e.target.value))}
            className="w-full px-3 py-2 text-sm bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="TODAS">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c.idCategoria} value={c.idCategoria}>
                {c.nombreCategoria}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs mb-1 text-muted-foreground font-medium">Marca</label>
          <select
            value={filtroMarca}
            onChange={(e) => setFiltroMarca(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="TODAS">Todas las marcas</option>
            {marcasUnicas.map((marca) => (
              <option key={String(marca)} value={String(marca)}>
                {String(marca)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs mb-1 text-muted-foreground font-medium">Proveedor</label>
          <select
            value={filtroProveedor}
            onChange={(e) => setFiltroProveedor(e.target.value === 'TODOS' ? 'TODOS' : Number(e.target.value))}
            className="w-full px-3 py-2 text-sm bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="TODOS">Todos los proveedores</option>
            {proveedores.map((p) => (
              <option key={p.idProveedor} value={p.idProveedor}>
                {p.nombreProveedor}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-auto flex bg-muted/50 border border-border p-1 rounded-lg">
          <Button
            variant={filtroStock === 'TODOS' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFiltroStock('TODOS')}
            className="text-xs"
          >
            Todos
          </Button>
          <Button
            variant={filtroStock === 'EN_STOCK' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFiltroStock('EN_STOCK')}
            className="text-xs text-emerald-600 dark:text-emerald-400"
          >
            Normal
          </Button>
          <Button
            variant={filtroStock === 'POCO_STOCK' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFiltroStock('POCO_STOCK')}
            className="text-xs text-amber-600 dark:text-amber-400"
          >
            Poco Stock
          </Button>
          <Button
            variant={filtroStock === 'AGOTADO' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFiltroStock('AGOTADO')}
            className="text-xs text-destructive"
          >
            Agotados
          </Button>
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="bg-card border border-border rounded-xl overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Cargando inventario...</div>
        ) : productosFiltrados.length === 0 ? (
          <div className="text-center p-12 bg-card">
            <Filter size={40} className="mx-auto mb-3 opacity-20 text-muted-foreground" />
            <p className="text-muted-foreground font-medium">No se encontraron productos bajo este filtro.</p>
            <Button
              variant="link"
              onClick={() => {
                setFiltroCategoria('TODAS');
                setFiltroMarca('TODAS');
                setFiltroProveedor('TODOS');
                setFiltroStock('TODOS');
              }}
              className="mt-2 text-accent"
            >
              Limpiar filtros
            </Button>
          </div>
        ) : (
          <table className="w-full min-w-[800px]">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4 text-foreground w-16">Img</th>
                <th className="text-left p-4 text-foreground">Producto & Código</th>
                <th className="text-left p-4 text-foreground">Categoría</th>
                <th className="text-left p-4 text-foreground">Precio</th>
                <th className="text-left p-4 text-foreground">Stock</th>
                <th className="text-right p-4 text-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map((producto) => (
                <tr key={producto.idProducto} className="border-t border-border hover:bg-muted/50 transition-colors">
                  <td className="p-4">
                    {producto.imagenUrl ? (
                      <img
                        src={producto.imagenUrl}
                        alt={producto.nombre}
                        className="w-10 h-10 rounded-md object-cover border border-border"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                        <Package size={18} className="text-muted-foreground" />
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-foreground">{producto.nombre}</div>
                    <div className="text-xs text-muted-foreground">
                      {producto.marca} | <span className="font-mono">{producto.codigoProducto}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                      {producto.categoria?.nombreCategoria || 'Sin categoría'}
                    </span>
                  </td>
                  <td className="p-4">
                    {producto.precioFinal && producto.precioFinal < producto.precioVenta ? (
                      <div className="flex flex-col">
                        <span className="text-accent font-bold text-base">
                          {formatCurrency(producto.precioFinal)}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground line-through opacity-70">
                            {formatCurrency(producto.precioVenta)}
                          </span>
                          <span className="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded font-medium">
                            -{producto.oferta?.descuento}%
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-accent font-semibold text-base">
                        {formatCurrency(producto.precioVenta)}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        producto.stock > 10
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400'
                          : producto.stock > 0
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400'
                      }`}
                    >
                      {producto.stock} uds
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => abrirModal(producto)}
                        className="p-2 hover:bg-muted rounded-lg text-foreground transition-colors"
                        title="Editar producto"
                        aria-label={`Editar ${producto.nombre}`}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => eliminar(producto.idProducto)}
                        className="p-2 hover:bg-destructive/20 text-destructive rounded-lg transition-colors"
                        title="Eliminar producto"
                        aria-label={`Eliminar ${producto.nombre}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Dialog con validaciones integradas */}
      <Dialog.Root open={modalAbierto} onOpenChange={setModalAbierto}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <Dialog.Title className="mb-6 text-card-foreground text-xl font-bold">
              {productoEditando ? 'Editar Producto' : 'Nuevo Producto'}
            </Dialog.Title>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Columna Izquierda: Datos del Producto */}
                <div className="space-y-4">
                  <Input
                    label="Código (SKU) *"
                    placeholder="MOT-TOR-001"
                    className="uppercase"
                    error={errors.codigoProducto?.message}
                    {...register('codigoProducto', {
                      required: 'El código de producto no puede estar vacío',
                      maxLength: {
                        value: 50,
                        message: 'El código no debe superar los 50 caracteres',
                      },
                      validate: (v) => v.trim().length > 0 || 'El código no puede consistir solo de espacios',
                    })}
                  />

                  <Input
                    label="Nombre del producto *"
                    placeholder="Bujía Spark Plug BKR6E"
                    error={errors.nombre?.message}
                    {...register('nombre', {
                      required: 'El nombre del producto no puede estar vacío',
                      maxLength: {
                        value: 150,
                        message: 'El nombre no debe superar los 150 caracteres',
                      },
                      validate: (v) => v.trim().length > 0 || 'El nombre no puede consistir solo de espacios',
                    })}
                  />

                  <Input
                    label="Marca *"
                    placeholder="Bajaj, NGK, Motul..."
                    error={errors.marca?.message}
                    {...register('marca', {
                      required: 'La marca no puede estar vacía',
                      maxLength: {
                        value: 100,
                        message: 'La marca no debe superar los 100 caracteres',
                      },
                      validate: (v) => v.trim().length > 0 || 'La marca no puede consistir solo de espacios',
                    })}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Precio Venta (S/.) *"
                      type="number"
                      step="0.50"
                      min={0}
                      placeholder="35.00"
                      error={errors.precioVenta?.message}
                      {...register('precioVenta', {
                        required: 'El precio de venta es obligatorio',
                        valueAsNumber: true,
                        min: {
                          value: 0,
                          message: 'El precio de venta debe ser cero o positivo',
                        },
                        validate: (v) =>
                          (!isNaN(v) && v >= 0) || 'El precio de venta debe ser cero o un valor positivo',
                      })}
                    />

                    <Input
                      label="Stock *"
                      type="number"
                      min={0}
                      placeholder="10"
                      error={errors.stock?.message}
                      {...register('stock', {
                        required: 'El stock es obligatorio',
                        valueAsNumber: true,
                        min: {
                          value: 0,
                          message: 'El stock no puede ser negativo',
                        },
                        validate: (v) =>
                          (Number.isInteger(Number(v)) && Number(v) >= 0) || 'Debe ser un número entero mayor o igual a 0',
                      })}
                    />
                  </div>
                </div>

                {/* Columna Derecha: Relaciones y Multimedia */}
                <div className="space-y-4">
                  
                  {/* Select Categoría */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="idCategoria" className="text-sm font-medium text-foreground">
                      Categoría *
                    </label>
                    <div className="relative">
                      <select
                        id="idCategoria"
                        className={`w-full px-4 py-2.5 bg-background border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer ${
                          errors.idCategoria ? 'border-destructive focus:ring-destructive' : 'border-input'
                        }`}
                        {...register('idCategoria', {
                          valueAsNumber: true,
                          validate: (v) => v > 0 || 'La categoría es obligatoria',
                        })}
                      >
                        <option value={0}>Selecciona una categoría</option>
                        {categorias.map((c) => (
                          <option key={c.idCategoria} value={c.idCategoria}>
                            {c.nombreCategoria}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={16}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none opacity-60"
                      />
                    </div>
                    {errors.idCategoria && (
                      <p className="text-xs text-destructive flex items-center gap-1 mt-0.5">
                        <AlertCircle size={12} />
                        {errors.idCategoria.message}
                      </p>
                    )}
                  </div>

                  {/* Select Proveedor */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="idProveedor" className="text-sm font-medium text-foreground">
                      Proveedor *
                    </label>
                    <div className="relative">
                      <select
                        id="idProveedor"
                        className={`w-full px-4 py-2.5 bg-background border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer ${
                          errors.idProveedor ? 'border-destructive focus:ring-destructive' : 'border-input'
                        }`}
                        {...register('idProveedor', {
                          valueAsNumber: true,
                          validate: (v) => v > 0 || 'El proveedor es obligatorio',
                        })}
                      >
                        <option value={0}>Selecciona un proveedor</option>
                        {proveedores.map((p) => (
                          <option key={p.idProveedor} value={p.idProveedor}>
                            {p.nombreProveedor}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={16}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none opacity-60"
                      />
                    </div>
                    {errors.idProveedor && (
                      <p className="text-xs text-destructive flex items-center gap-1 mt-0.5">
                        <AlertCircle size={12} />
                        {errors.idProveedor.message}
                      </p>
                    )}
                  </div>

                  {/* Select Oferta */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="idOferta" className="text-sm font-medium text-foreground">
                      Oferta promocional (Opcional)
                    </label>
                    <div className="relative">
                      <select
                        id="idOferta"
                        className="w-full px-4 py-2.5 bg-background border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
                        {...register('idOferta', { valueAsNumber: true })}
                      >
                        <option value={0}>Sin oferta activa</option>
                        {ofertas.map((o) => (
                          <option key={o.idOferta} value={o.idOferta}>
                            {o.titulo} (-{o.descuento}%)
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={16}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none opacity-60"
                      />
                    </div>
                  </div>

                  {/* URL de Imagen */}
                  <div>
                    <Input
                      label="URL de la imagen (Opcional)"
                      placeholder="https://ejemplo.com/repuesto.jpg"
                      error={errors.imagenUrl?.message}
                      {...register('imagenUrl', {
                        validate: (v) =>
                          !v ||
                          /^https?:\/\/.+/i.test(v.trim()) ||
                          'Ingresa una URL válida que empiece por http:// o https://',
                      })}
                    />
                    {imagenUrlWatch && !errors.imagenUrl && (
                      <div className="mt-3 p-2 border border-border rounded-lg bg-muted flex items-center justify-center">
                        <img
                          src={imagenUrlWatch}
                          alt="Vista previa"
                          className="max-h-24 object-contain rounded"
                          onError={(e) => {
                            // Si la imagen falla en cargar, oculta la vista rota
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
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
                    : productoEditando
                    ? 'Actualizar Producto'
                    : 'Guardar Producto'}
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};