# 🏍️ VLC Mototaxis - Sistema de Gestión

Sistema completo de gestión para mecánica de mototaxis con 3 roles: Cliente, Trabajador y Administrador.

## 🎨 Características

- ✅ **Diseño Premium**: Interfaz elegante con paleta negro/azul profundo/dorado
- ✅ **3 Roles de Usuario**: Cliente, Trabajador, Administrador
- ✅ **Sistema de Autenticación Seguro**: Con validación completa
- ✅ **Dashboards Interactivos**: Con gráficos y reportes
- ✅ **Responsive Design**: Funciona en desktop y tablet
- ✅ **Animaciones Fluidas**: Microinteracciones con Motion

## 🚀 Instalación y Ejecución

### Requisitos Previos

- **Node.js** versión 18 o superior
- **pnpm** (gestor de paquetes)

### Instalación de pnpm

Si no tienes pnpm instalado:

```bash
npm install -g pnpm
```

### Pasos para Ejecutar el Proyecto

1. **Clonar o descargar el proyecto**

2. **Abrir en Visual Studio Code**
   ```bash
   cd ruta/del/proyecto
   code .
   ```

3. **Instalar dependencias**
   ```bash
   pnpm install
   ```

4. **Iniciar el servidor de desarrollo**
   ```bash
   pnpm run dev
   ```

5. **Abrir en el navegador**
   
   El proyecto se abrirá automáticamente en `http://localhost:5173`

## 🔐 Cuentas de Prueba

### Cliente
- **Email**: `cliente@vlc.com`
- **Password**: `cliente123`
- **Acceso**: Reservar citas, comprar productos, ver historial

### Trabajador
- **Email**: `trabajador@vlc.com`
- **Password**: `trabajador123`
- **Acceso**: Gestionar citas, pedidos, horarios

### Administrador
- **Email**: `admin@vlc.com`
- **Password**: `admin123`
- **Acceso**: Panel completo de administración

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── components/
│   │   ├── ui/           # Componentes de interfaz (Button, Card, Input)
│   │   └── layout/       # Componentes de layout (Header, Sidebar)
│   ├── context/          # Context API (AuthContext)
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── RecuperarPassword.tsx
│   │   ├── cliente/      # Dashboard y vistas del cliente
│   │   ├── trabajador/   # Dashboard y vistas del trabajador
│   │   └── admin/        # Dashboard y vistas del administrador
│   └── App.tsx
└── styles/
    ├── theme.css         # Variables CSS personalizadas
    └── fonts.css         # Fuentes
```

## 🎯 Funcionalidades por Rol

### 👤 Cliente
- Reservar citas de servicio
- Comprar productos (carrito)
- Ver historial de citas
- Ver historial de pedidos
- Dejar reseñas y calificaciones

### 🔧 Trabajador
- Ver agenda de citas (diaria/semanal)
- Gestionar estado de citas
- Actualizar pedidos
- Configurar horarios de disponibilidad
- Ver reseñas recibidas

### ⚙️ Administrador
- Dashboard con reportes y gráficos
- CRUD de usuarios
- CRUD de servicios
- CRUD de productos
- Gestión de ofertas
- Gestión de categorías
- Gestión de proveedores
- Historial de movimientos de stock

## 🛠️ Tecnologías Utilizadas

- **React 18** - Framework UI
- **TypeScript** - Tipado estático
- **Tailwind CSS v4** - Estilos
- **React Router** - Navegación
- **React Hook Form** - Formularios
- **Recharts** - Gráficos
- **Radix UI** - Componentes accesibles
- **Motion** - Animaciones
- **Sonner** - Notificaciones
- **Lucide React** - Iconos
- **Vite** - Build tool

## 🎨 Paleta de Colores

```css
--background: #0a0a0f (Negro suave)
--primary: #1e3a8a (Azul profundo)
--accent: #d4af37 (Dorado)
--card: #14141f (Gris oscuro)
--muted: #27293d (Gris medio)
```

## 📝 Registro de Nuevos Usuarios

El sistema permite registrar nuevos usuarios con validación completa:

- **Validación de email** (formato correcto)
- **Validación de contraseña**:
  - Mínimo 8 caracteres
  - Al menos una mayúscula
  - Al menos una minúscula
  - Al menos un número
  - Al menos un carácter especial
- **Indicador visual** de fortaleza de contraseña
- **Verificación de contraseña** (confirmación)
- **Validación de teléfono**
- **Selección de rol** (Cliente o Trabajador)

## 🔒 Seguridad Implementada

- ✅ Validación de formularios con react-hook-form
- ✅ Validación de email con regex
- ✅ Validación de contraseña fuerte
- ✅ Protección de rutas por rol
- ✅ Contexto de autenticación global
- ✅ LocalStorage para persistencia de sesión
- ✅ Logout seguro

## 🐛 Solución de Problemas

### Error: "Cannot find module"
```bash
pnpm install --force
```

### El puerto 5173 está ocupado
```bash
# Editar vite.config.ts y cambiar el puerto
# O matar el proceso:
lsof -ti:5173 | xargs kill
```

### Los estilos no se aplican
```bash
# Limpiar caché y reinstalar
rm -rf node_modules .vite
pnpm install
pnpm run dev
```

## 📦 Scripts Disponibles

```bash
pnpm run dev      # Desarrollo
pnpm run build    # Construir para producción
pnpm run preview  # Vista previa de producción
```

## 🚀 Despliegue

Para construir para producción:

```bash
pnpm run build
```

Los archivos optimizados estarán en la carpeta `dist/`

## 📄 Licencia

Este proyecto es un sistema de gestión privado para VLC Mototaxis.

## 👥 Soporte

Para reportar problemas o solicitar nuevas funcionalidades, contacta al equipo de desarrollo.

---

**Desarrollado con ❤️ para VLC Mototaxis**
