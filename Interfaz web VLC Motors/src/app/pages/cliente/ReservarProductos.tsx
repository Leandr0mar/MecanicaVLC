import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/button';
import { ShoppingCart, Minus, Plus, Trash2, Package, Filter } from 'lucide-react'; // <-- Se añadió Filter
import { toast } from 'sonner';
import { formatCurrency } from '../../utils/currency';
import { motion } from 'motion/react';
import { API_URL } from '../../context/AuthContext';

interface CartItem {
  idProducto: number;
  cantidad: number;
}

export const ReservarProductos = () => {
  const [productos, setProductos] = useState<any[]>([]);
  const [carrito, setCarrito] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS PARA LOS DATOS FORÁNEOS Y FILTROS ---
  const [categorias, setCategorias] = useState<any[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);
  
  const [filtroCategoria, setFiltroCategoria] = useState<number | 'TODAS'>('TODAS');
  const [filtroMarca, setFiltroMarca] = useState<string | 'TODAS'>('TODAS');
  const [filtroProveedor, setFiltroProveedor] = useState<number | 'TODOS'>('TODOS');
  const [filtroStock, setFiltroStock] = useState<string | 'TODOS'>('TODOS');

  useEffect(() => {
    cargarDatos();
  }, []);

  // --- ACTUALIZADO: Carga productos, categorías y proveedores en paralelo ---
  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resProd, resCat, resProv] = await Promise.all([
        fetch(`${API_URL}/api/productos`, { credentials: 'include' }),
        fetch(`${API_URL}/api/categorias`, { credentials: 'include' }),
        fetch(`${API_URL}/api/proveedores`, { credentials: 'include' })
      ]);
      
      if (resProd.status === 401) return (window.location.href = '/iniciar-sesion');
      if (!resProd.ok) throw new Error('Error al cargar el inventario');

      setProductos(await resProd.json());
      if (resCat.ok) setCategorias(await resCat.json());
      if (resProv.ok) setProveedores(await resProv.json());
      
    } catch (error) {
      toast.error('Error al cargar la información de los productos');
    } finally {
      setLoading(false);
    }
  };

  const agregarAlCarrito = (idProducto: number) => {
    const existing = carrito.find((item) => item.idProducto === idProducto);
    if (existing) {
      setCarrito(carrito.map((item) =>
        item.idProducto === idProducto ? { ...item, cantidad: item.cantidad + 1 } : item
      ));
    } else {
      setCarrito([...carrito, { idProducto, cantidad: 1 }]);
    }
    toast.success('Producto agregado al carrito');
  };

  const actualizarCantidad = (idProducto: number, cambio: number) => {
    setCarrito(
      carrito
        .map((item) =>
          item.idProducto === idProducto ? { ...item, cantidad: item.cantidad + cambio } : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const eliminarDelCarrito = (idProducto: number) => {
    setCarrito(carrito.filter((item) => item.idProducto !== idProducto));
    toast.info('Producto eliminado del carrito');
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => {
      const producto = productos.find((p) => p.idProducto === item.idProducto);
      if (!producto) return total;
      
      const precioAplicar = (producto.precioFinal && producto.precioFinal < producto.precioVenta) 
        ? producto.precioFinal 
        : producto.precioVenta;

      return total + (precioAplicar * item.cantidad);
    }, 0);
  };

  const finalizarCompra = async () => {
    if (carrito.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    const payload = {
      items: carrito.map(item => ({
        idProducto: item.idProducto,
        cantidad: item.cantidad
      }))
    };

    try {
      const res = await fetch(`${API_URL}/api/ordenes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (res.status === 401) return (window.location.href = '/iniciar-sesion');
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Error al procesar la reserva');
      }

      toast.success('¡Reserva realizada y procesada con éxito!');
      setCarrito([]); 
      cargarDatos(); // Refrescamos el grid completo para actualizar el stock real
    } catch (error: any) {
      toast.error(error.message);
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-foreground">Reservar Productos</h2>
        <p className="text-muted-foreground">Selecciona los repuestos a comprar</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- LISTA DE PRODUCTOS Y FILTROS --- */}
        <div className="lg:col-span-2">
          
          {/* BARRA DE FILTROS */}
          <div className="bg-card border border-border p-4 rounded-xl flex flex-wrap gap-4 items-end mb-6">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs mb-1 text-muted-foreground font-medium">Categoría</label>
              <select 
                value={filtroCategoria} 
                onChange={(e) => setFiltroCategoria(e.target.value === 'TODAS' ? 'TODAS' : Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="TODAS">Todas</option>
                {categorias.map(c => <option key={c.idCategoria} value={c.idCategoria}>{c.nombreCategoria}</option>)}
              </select>
            </div>

            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs mb-1 text-muted-foreground font-medium">Marca</label>
              <select 
                value={filtroMarca} 
                onChange={(e) => setFiltroMarca(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="TODAS">Todas</option>
                {marcasUnicas.map(marca => <option key={marca as string} value={marca as string}>{marca}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Cargando inventario de productos...</div>
          ) : productosFiltrados.length === 0 ? (
            <div className="p-12 text-center bg-card rounded-xl border border-border">
              <Filter size={40} className="mx-auto mb-3 opacity-20 text-muted-foreground" />
              <p className="text-muted-foreground font-medium">No se encontraron productos bajo este filtro.</p>
              <Button variant="link" onClick={() => { setFiltroCategoria('TODAS'); setFiltroMarca('TODAS'); setFiltroProveedor('TODOS'); setFiltroStock('TODOS'); }} className="mt-2 text-accent">
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {productosFiltrados.map((producto, index) => (
                <motion.div
                  key={producto.idProducto}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card hover>
                    <CardContent className="p-4 flex flex-col h-full">
                      <div className="text-center mb-4">
                        {producto.imagenUrl ? (
                          <img src={producto.imagenUrl} alt={producto.nombre} className="h-24 w-full object-contain mb-2 rounded-md" />
                        ) : (
                          <div className="h-24 w-full bg-muted flex items-center justify-center mb-2 rounded-md text-muted-foreground">
                            <Package size={32} />
                          </div>
                        )}
                        <h4 className="mb-1 text-card-foreground text-sm font-bold line-clamp-2">{producto.nombre}</h4>
                        <p className="text-xs text-muted-foreground">Stock: {producto.stock} uds</p>
                      </div>
                      
                      <div className="mt-auto flex items-end justify-between mb-3">
                        {producto.precioFinal && producto.precioFinal < producto.precioVenta ? (
                          <div className="flex flex-col">
                            <span className="font-bold text-accent text-lg">{formatCurrency(producto.precioFinal)}</span>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground line-through opacity-70">{formatCurrency(producto.precioVenta)}</span>
                              <span className="text-[10px] bg-red-500/10 text-red-500 px-1 py-0.5 rounded font-bold">-{producto.oferta?.descuento}%</span>
                            </div>
                          </div>
                        ) : (
                          <span className="font-bold text-accent text-lg">{formatCurrency(producto.precioVenta)}</span>
                        )}
                        
                        <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${
                          producto.stock > 10 ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 
                          producto.stock > 0 ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' : 
                          'bg-red-500/20 text-red-600 dark:text-red-400'
                        }`}>
                          {producto.stock > 10 ? 'Disponible' : producto.stock > 0 ? 'Poco stock' : 'Agotado'}
                        </span>
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => agregarAlCarrito(producto.idProducto)}
                        disabled={producto.stock === 0}
                      >
                        {producto.stock === 0 ? 'Agotado' : 'Agregar'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* --- PANEL DEL CARRITO --- */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart size={20} className="text-accent" />
                Carrito ({carrito.reduce((acc, item) => acc + item.cantidad, 0)})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {carrito.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart size={48} className="mx-auto mb-2 opacity-30" />
                  <p>Tu carrito está vacío</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {carrito.map((item) => {
                      const producto = productos.find((p) => p.idProducto === item.idProducto);
                      if (!producto) return null;

                      const precioMostrar = (producto.precioFinal && producto.precioFinal < producto.precioVenta) 
                        ? producto.precioFinal 
                        : producto.precioVenta;

                      return (
                        <div key={item.idProducto} className="p-3 bg-muted rounded-lg border border-border">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 pr-2">
                              <p className="font-medium text-xs text-foreground line-clamp-1">{producto.nombre}</p>
                              <p className="text-accent font-semibold text-sm">{formatCurrency(precioMostrar)}</p>
                            </div>
                            <button
                              onClick={() => eliminarDelCarrito(item.idProducto)}
                              className="text-destructive hover:bg-destructive/10 p-1 rounded transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mt-2 bg-background rounded border border-border p-1 w-fit">
                            <button
                              onClick={() => actualizarCantidad(item.idProducto, -1)}
                              className="w-6 h-6 rounded flex items-center justify-center hover:bg-muted"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-6 text-center text-xs font-medium">{item.cantidad}</span>
                            <button
                              onClick={() => actualizarCantidad(item.idProducto, 1)}
                              className="w-6 h-6 rounded flex items-center justify-center hover:bg-muted"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 border-t border-border mt-4">
                    <div className="flex justify-between items-end mb-4 bg-muted p-3 rounded-lg border border-border">
                      <span className="font-medium text-foreground text-sm">Total a pagar:</span>
                      <span className="font-black text-accent text-xl">{formatCurrency(calcularTotal())}</span>
                    </div>
                    <Button variant="accent" className="w-full font-bold" onClick={finalizarCompra}>
                      Procesar Orden
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};