# VLC Mototaxis

Sistema web para administrar una mecánica de mototaxis. Incluye una interfaz React para clientes, trabajadores y administradores, y un backend REST desarrollado con Spring Boot.

## Funcionalidades

### Cliente

- Registro con DNI o carné de extranjería.
- Selección del código telefónico internacional y registro del número de contacto.
- Reserva y seguimiento de citas, pedidos y servicios.
- Visualización de la boleta de una cita cuando el administrador confirma su cierre y pago presencial; la boleta se puede exportar a PDF.
- Publicación de reseñas sobre los servicios recibidos.

### Trabajador

- Agenda, gestión y actualización de citas asignadas.
- Vista de pedidos y horarios de disponibilidad.
- Consulta de calificaciones y reseñas con información del cliente.
- Las citas concluidas por el trabajador quedan pendientes de pago hasta que el administrador cierre el proceso.

### Administrador

- Gestión de usuarios, citas, servicios, productos, categorías, ofertas y proveedores.
- Activación y desactivación de cuentas de usuario. Una cuenta desactivada no puede iniciar sesión; la acción no elimina el registro.
- Búsqueda dinámica en las secciones de administración y filtros por categoría cuando están disponibles.
- Confirmación mediante modal antes de eliminar registros.
- Reportes, historial de stock y consolidado de ingresos.
- Cierre de citas y registro del pago presencial.

## Estructura

```text
.
├── Interfaz web VLC Motors/   # Frontend React + TypeScript + Vite
└── dashboarvlc/               # Backend Spring Boot + JPA
```

## Requisitos

- Node.js 18 o superior y npm (o pnpm).
- Java 17.
- Maven, o usar el Maven Wrapper si está incluido.
- Una instancia de PostgreSQL o MySQL, según la configuración de base de datos del backend.

## Ejecutar el frontend

```bash
cd "Interfaz web VLC Motors"
npm install
npm run dev
```

Vite indica en la terminal la dirección local, normalmente `http://localhost:5173`.

Para compilar:

```bash
npm run build
```

## Ejecutar el backend

Configura primero la conexión a la base de datos y las credenciales necesarias en `dashboarvlc/src/main/resources/application.properties` o mediante variables de entorno. No publiques credenciales reales en el repositorio.

Desde la carpeta `dashboarvlc`, inicia la aplicación con Maven:

```bash
mvn spring-boot:run
```

En Windows, si el proyecto incluye Maven Wrapper, también puedes usar `mvnw.cmd spring-boot:run`.

El frontend consume la API REST del backend. Asegúrate de que ambos servicios estén ejecutándose y que la URL base de la API configurada en el frontend apunte al backend.

## Tecnologías principales

- **Frontend:** React 18, TypeScript, Vite, React Router, React Hook Form, Tailwind CSS, Radix UI, Recharts, Sonner y Lucide.
- **Backend:** Java 17, Spring Boot 4, Spring Web MVC, Spring Data JPA, Spring Security y Bean Validation.
- **Persistencia:** PostgreSQL o MySQL, según el perfil/configuración utilizado.

## Notas del flujo de citas y pagos

Los pagos se registran presencialmente. Cuando el trabajador marca un servicio como realizado, la cita permanece como completada pendiente de pago. El administrador registra el pago y finaliza el proceso; después, el cliente puede consultar y descargar la boleta desde sus citas.

## Cuentas de demostración

La pantalla de acceso puede mostrar cuentas de prueba para la exposición. Usa las credenciales configuradas en el entorno o en los datos de demostración de la base de datos; los usuarios de prueba no se crean automáticamente solo por iniciar el frontend.

