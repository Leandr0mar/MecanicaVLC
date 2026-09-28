import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
// Añadimos el icono Download importado de lucide-react
import { Plus, Edit2, Trash2, Package, Image as ImageIcon, Filter, Download } from 'lucide-react';
import { toast } from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';
import { Input } from '../../components/ui/input';
import { formatCurrency } from '../../utils/currency';
import { API_URL } from '../../context/AuthContext';
// Importamos la librería para Excel
import * as XLSX from 'xlsx';

const formInicial = {
  nombre: '',
  codigoProducto: '',
  marca: '',
  precioVenta: 0,
  stock: 0,
  imagenUrl: '',
  idCategoria: 0,
  idProveedor: 0,
  idOferta: 0,
};

export const Productos = () => {
  const [productos, setProductos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [ofertas, setOfertas] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState<any | null>(null);
  const [formData, setFormData] = useState(formInicial);

  // --- ESTADOS PARA LOS FILTROS ---
  const [filtroCategoria, setFiltroCategoria] = useState<number | 'TODAS'>('TODAS');
  const [filtroMarca, setFiltroMarca] = useState<string | 'TODAS'>('TODAS');
  const [filtroProveedor, setFiltroProveedor] = useState<number | 'TODOS'>('TODOS');
  const [filtroStock, setFiltroStock] = useState<string | 'TODOS'>('TODOS');

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
        fetch(`${API_URL}/api/ofertas`, { credentials: 'include' })
      ]);

      if (resProd.status === 401) return (window.location.href = '/iniciar-sesion');

      if (resProd.ok) setProductos(await resProd.json());
      if (resCat.ok) setCategorias(await resCat.json());
      if (resProv.ok) setProveedores(await resProv.json());
      if (resOf.ok) setOfertas(await resOf.json());

    } catch (error) {
      toast.error('Error al cargar la información del inventario');
    } finally {
      setLoading(false);
    }
  };

  const eliminar = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/productos/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.status === 401) return (window.location.href = '/iniciar-sesion');
      if (!res.ok) throw new Error('Error');
      await cargarDatos();
      toast.success('Producto eliminado');
    } catch (error) {
      toast.error('No se pudo eliminar el producto');
    }
  };

  const abrirModal = (producto?: any) => {
    if (producto) {
      setProductoEditando(producto);
      setFormData({
        nombre: producto.nombre,
        codigoProducto: producto.codigoProducto,
        marca: producto.marca,
        precioVenta: producto.precioVenta,
        stock: producto.stock,
        imagenUrl: producto.imagenUrl || '',
        idCategoria: producto.categoria?.idCategoria || 0,
        idProveedor: producto.proveedor?.idProveedor || 0,
        idOferta: producto.oferta?.idOferta || 0,
      });
    } else {
      setProductoEditando(null);
      setFormData(formInicial);
    }
    setModalAbierto(true);
  };

  const guardar = async () => {
    if (!formData.nombre || !formData.codigoProducto || !formData.marca) return toast.error('Complete los datos básicos');
    if (formData.idCategoria === 0) return toast.error('Debe seleccionar una categoría');
    if (formData.idProveedor === 0) return toast.error('Debe seleccionar un proveedor');

    const payload = {
      nombre: formData.nombre,
      codigoProducto: formData.codigoProducto,
      marca: formData.marca,
      precioVenta: formData.precioVenta,
      stock: formData.stock,
      imagenUrl: formData.imagenUrl,
      categoria: { idCategoria: formData.idCategoria },
      proveedor: { idProveedor: formData.idProveedor },
      oferta: formData.idOferta > 0 ? { idOferta: formData.idOferta } : null
    };

    try {
      const url = productoEditando ? `${API_URL}/api/productos/${productoEditando.idProducto}` : `${API_URL}/api/productos`;
      const method = productoEditando ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.status === 401) return (window.location.href = '/iniciar-sesion');
      if (!res.ok) throw new Error('Error al guardar');

      await cargarDatos();
      toast.success(productoEditando ? 'Producto actualizado' : 'Producto creado');
      setModalAbierto(false);
    } catch (error) {
      toast.error('Error al guardar. Revise que el código no esté duplicado.');
    }
  };

  // --- LÓGICA DE FILTRADO ---
  const marcasUnicas = Array.from(new Set(productos.map(p => p.marca))).sort();

  const productosFiltrados = productos.filter(producto => {
    const cumpleCategoria = filtroCategoria === 'TODAS' || producto.categoria?.idCategoria === filtroCategoria;
    const cumpleMarca = filtroMarca === 'TODAS' || producto.marca === filtroMarca;
    const cumpleProveedor = filtroProveedor === 'TODOS' || producto.proveedor?.idProveedor === filtroProveedor;
    
    let cumpleStock = true;
    if (filtroStock === 'AGOTADO') cumpleStock = producto.stock === 0;
    else if (filtroStock === 'POCO_STOCK') cumpleStock = producto.stock > 0 && producto.stock <= 5;
    else if (filtroStock === 'EN_STOCK') cumpleStock = producto.stock > 5;

    return cumpleCategoria && cumpleMarca && cumpleProveedor && cumpleStock;
  });

  // --- NUEVA LÓGICA: EXPORTAR A EXCEL ---
  const exportarExcel = () => {
    if (productosFiltrados.length === 0) {
      return toast.error('No hay productos para exportar');
    }

    // 1. Mapeamos los datos para que el Excel tenga cabeceras claras y datos legibles
    const datosExcel = productosFiltrados.map((p) => {
      // Determinamos el precio final real
      const precioCalculado = (p.precioFinal && p.precioFinal < p.precioVenta) ? p.precioFinal : p.precioVenta;
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
        'Estado Inventario': estadoStock
      };
    });

    // 2. Creamos la hoja de trabajo y el libro
    const worksheet = XLSX.utils.json_to_sheet(datosExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario');

    // 3. Ajustamos el ancho de las columnas para mejor lectura
    const wscols = [
      { wch: 15 }, // Código
      { wch: 35 }, // Producto
      { wch: 15 }, // Marca
      { wch: 20 }, // Categoría
      { wch: 25 }, // Proveedor
      { wch: 15 }, // Precio Base
      { wch: 15 }, // Precio Final
      { wch: 20 }, // Oferta
      { wch: 12 }, // Stock
      { wch: 18 }  // Estado
    ];
    worksheet['!cols'] = wscols;

    // 4. Descargamos el archivo
    XLSX.writeFile(workbook, `Reporte_Inventario_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Excel exportado correctamente');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-2 text-foreground">Productos</h2>
          <p className="text-muted-foreground">Administra el inventario de repuestos</p>
        </div>
        
        {/* MODIFICACIÓN: Agrupamos los botones de acción */}
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={exportarExcel} className="gap-2 bg-green-600/10 text-green-600 hover:bg-green-600/20 hover:text-green-700 dark:text-green-400 border border-green-600/20">
            <Download size={18} />
            Exportar Excel
          </Button>
          <Button variant="accent" onClick={() => abrirModal()} className="gap-2">
            <Plus size={18} />
            Nuevo Producto
          </Button>
        </div>
      </div>

      {/* --- BARRA DE FILTROS --- */}
      <div className="bg-card border border-border p-4 rounded-xl flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs mb-1 text-muted-foreground font-medium">Categoría</label>
          <select 
            value={filtroCategoria} 
            onChange={(e) => setFiltroCategoria(e.target.value === 'TODAS' ? 'TODAS' : Number(e.target.value))}
            className="w-full px-3 py-2 text-sm bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="TODAS">Todas las categorías</option>
            {categorias.map(c => <option key={c.idCategoria} value={c.idCategoria}>{c.nombreCategoria}</option>)}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs mb-1 text-muted-foreground font-medium">Marca</label>
          <select 
            value={filtroMarca} 
            onChange={(e) => setFiltroMarca(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="TODAS">Todas las marcas</option>
            {marcasUnicas.map(marca => <option key={marca as string} value={marca as string}>{marca}</option>)}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs mb-1 text-muted-foreground font-medium">Proveedor</label>
          <select 
            value={filtroProveedor} 
            onChange={(e) => setFiltroProveedor(e.target.value === 'TODOS' ? 'TODOS' : Number(e.target.value))}
            className="w-full px-3 py-2 text-sm bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="TODOS">Todos los proveedores</option>
            {proveedores.map(p => <option key={p.idProveedor} value={p.idProveedor}>{p.nombreProveedor}</option>)}
          </select>
        </div>

        <div className="w-full md:w-auto flex bg-muted/50 border border-border p-1 rounded-lg">
          <Button variant={filtroStock === 'TODOS' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFiltroStock('TODOS')} className="text-xs">Todos</Button>
          <Button variant={filtroStock === 'EN_STOCK' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFiltroStock('EN_STOCK')} className="text-xs text-green-600 dark:text-green-400">Normal</Button>
          <Button variant={filtroStock === 'POCO_STOCK' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFiltroStock('POCO_STOCK')} className="text-xs text-yellow-600 dark:text-yellow-400">Poco Stock</Button>
          <Button variant={filtroStock === 'AGOTADO' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFiltroStock('AGOTADO')} className="text-xs text-red-600 dark:text-red-400">Agotados</Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Cargando inventario...</div>
        ) : productosFiltrados.length === 0 ? (
          <div className="text-center p-12 bg-card">
            <Filter size={40} className="mx-auto mb-3 opacity-20 text-muted-foreground" />
            <p className="text-muted-foreground font-medium">No se encontraron productos bajo este filtro.</p>
            <Button variant="link" onClick={() => { setFiltroCategoria('TODAS'); setFiltroMarca('TODAS'); setFiltroProveedor('TODOS'); setFiltroStock('TODOS'); }} className="mt-2 text-accent">
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
                      <img src={producto.imagenUrl} alt={producto.nombre} className="w-10 h-10 rounded-md object-cover border border-border" />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                        <Package size={18} className="text-muted-foreground" />
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-foreground">{producto.nombre}</div>
                    <div className="text-xs text-muted-foreground">{producto.marca} | {producto.codigoProducto}</div>
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
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      producto.stock > 10 ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400' :
                      producto.stock > 5 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400' :
                      'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400'
                    }`}>
                      {producto.stock} uds
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => abrirModal(producto)} className="p-2 hover:bg-muted rounded-lg text-foreground transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => eliminar(producto.idProducto)} className="p-2 hover:bg-destructive/20 text-destructive rounded-lg transition-colors">
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

      {/* MODAL DE CREACIÓN / EDICIÓN */}
      <Dialog.Root open={modalAbierto} onOpenChange={setModalAbierto}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <Dialog.Title className="mb-6 text-card-foreground text-xl font-bold">
              {productoEditando ? 'Editar Producto' : 'Nuevo Producto'}
            </Dialog.Title>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Input label="Código (SKU)" placeholder="MOT-001" value={formData.codigoProducto} onChange={(e) => setFormData({...formData, codigoProducto: e.target.value})} />
                <Input label="Nombre del producto" placeholder="Aceite Motor 20W-50" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
                <Input label="Marca" placeholder="Castrol" value={formData.marca} onChange={(e) => setFormData({...formData, marca: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Precio Venta" type="number" placeholder="25" value={formData.precioVenta} onChange={(e) => setFormData({...formData, precioVenta: Number(e.target.value)})} />
                  <Input label="Stock Inicial" type="number" placeholder="15" value={formData.stock} onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})} />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2 text-foreground font-medium">Categoría *</label>
                  <select value={formData.idCategoria} onChange={(e) => setFormData({...formData, idCategoria: Number(e.target.value)})} className="w-full px-4 py-2 bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value={0}>Seleccionar...</option>
                    {categorias.map(c => <option key={c.idCategoria} value={c.idCategoria}>{c.nombreCategoria}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-2 text-foreground font-medium">Proveedor *</label>
                  <select value={formData.idProveedor} onChange={(e) => setFormData({...formData, idProveedor: Number(e.target.value)})} className="w-full px-4 py-2 bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value={0}>Seleccionar...</option>
                    {proveedores.map(p => <option key={p.idProveedor} value={p.idProveedor}>{p.nombreProveedor}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-2 text-foreground font-medium">Oferta Aplicable (Opcional)</label>
                  <select value={formData.idOferta} onChange={(e) => setFormData({...formData, idOferta: Number(e.target.value)})} className="w-full px-4 py-2 bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value={0}>Sin oferta activa</option>
                    {ofertas.map(o => <option key={o.idOferta} value={o.idOferta}>{o.titulo} (-{o.descuento}%)</option>)}
                  </select>
                </div>
                <div>
                  <Input label="URL de la Imagen (Opcional)" placeholder="https://ejemplo.com/foto.jpg" value={formData.imagenUrl} onChange={(e) => setFormData({...formData, imagenUrl: e.target.value})} />
                  {formData.imagenUrl && (
                    <div className="mt-3 p-2 border border-border rounded-lg bg-muted flex items-center justify-center">
                      <img src={formData.imagenUrl} alt="Vista previa" className="max-h-24 object-contain rounded" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Button variant="ghost" className="flex-1" onClick={() => setModalAbierto(false)}>Cancelar</Button>
              <Button variant="accent" className="flex-1" onClick={guardar}>Guardar Producto</Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};