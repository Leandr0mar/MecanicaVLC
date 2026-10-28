-- VLC Motors: lote adicional de datos variados para presentacion y consultas SQL.
-- Motor destino: Supabase PostgreSQL. Usa claves naturales (email, RUC y codigo)
-- para resolver relaciones; no presupone IDs consecutivos. Se puede ejecutar otra vez.
-- Cuentas nuevas de demostracion: todas usan DemoVLC2026! (se guarda con BCrypt).
-- No ejecutar en produccion. Los datos, RUC y contactos son ficticios.

CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

BEGIN;

-- Las versiones previas de la tabla restringian el metodo de pago y rechazaban
-- YAPE/PLIN. Se deja la regla alineada con el enum MetodoPago de la aplicacion.
ALTER TABLE public.citas DROP CONSTRAINT IF EXISTS citas_metodo_pago_check;
ALTER TABLE public.citas ADD CONSTRAINT citas_metodo_pago_check
  CHECK (metodo_pago IS NULL OR metodo_pago IN
    ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'BILLETERA_DIGITAL', 'YAPE', 'PLIN', 'OTRO'));

-- 1. ACTORES: 24 clientes, 5 trabajadores y 2 administradores ficticios.
-- DNI y CE se alternan; los CE no duplican el DNI legado.
WITH datos AS (
  SELECT * FROM (VALUES
    ('Mariana','Rojas','vlc-demo-cliente-01@demo.vlcmotors.test','DNI','81000001','+51 981000001','Av. Los Cedros 101, Lima','D1A-101','Bajaj','RE 4S'),
    ('Jorge','Salazar','vlc-demo-cliente-02@demo.vlcmotors.test','CE','CE8100002','+51 981000002','Jr. Las Palmeras 202, Lima','D2B-202','TVS','King Deluxe'),
    ('Lucia','Mendoza','vlc-demo-cliente-03@demo.vlcmotors.test','DNI','81000003','+51 981000003','Calle Los Pinos 303, Lima','D3C-303','Wanxin','W3'),
    ('Renato','Vargas','vlc-demo-cliente-04@demo.vlcmotors.test','CE','CE8100004','+51 981000004','Av. Central 404, Lima','D4D-404','Zongshen','200 ZS'),
    ('Valeria','Castro','vlc-demo-cliente-05@demo.vlcmotors.test','DNI','81000005','+51 981000005','Psje. Las Flores 505, Lima','D5E-505','Bajaj','Torito 4T'),
    ('Alonso','Paredes','vlc-demo-cliente-06@demo.vlcmotors.test','CE','CE8100006','+51 981000006','Av. Primavera 606, Lima','D6F-606','TVS','Neo NX'),
    ('Camila','Vega','vlc-demo-cliente-07@demo.vlcmotors.test','DNI','81000007','+51 981000007','Jr. Lima 707, Lima','D7G-707','Bajaj','RE 4S'),
    ('Mateo','Flores','vlc-demo-cliente-08@demo.vlcmotors.test','CE','CE8100008','+51 981000008','Calle Los Sauces 808, Lima','D8H-808','Wanxin','W3'),
    ('Daniela','Quispe','vlc-demo-cliente-09@demo.vlcmotors.test','DNI','81000009','+51 981000009','Av. Grau 909, Lima','D9J-909','Zongshen','200 ZS'),
    ('Sebastian','Herrera','vlc-demo-cliente-10@demo.vlcmotors.test','CE','CE8100010','+51 981000010','Jr. Union 110, Lima','D10K-110','Bajaj','Torito 4T'),
    ('Andrea','Navarro','vlc-demo-cliente-11@demo.vlcmotors.test','DNI','81000011','+51 981000011','Av. San Juan 211, Lima','D11L-211','TVS','King Deluxe'),
    ('Gabriel','Reyes','vlc-demo-cliente-12@demo.vlcmotors.test','CE','CE8100012','+51 981000012','Calle El Sol 312, Lima','D12M-312','Wanxin','W3'),
    ('Fiorella','Medina','vlc-demo-cliente-13@demo.vlcmotors.test','DNI','81000013','+51 981000013','Av. Los Alamos 413, Lima','D13N-413','Bajaj','RE 4S'),
    ('Nicolas','Aguilar','vlc-demo-cliente-14@demo.vlcmotors.test','CE','CE8100014','+51 981000014','Jr. Tacna 514, Lima','D14P-514','Zongshen','200 ZS'),
    ('Paola','Romero','vlc-demo-cliente-15@demo.vlcmotors.test','DNI','81000015','+51 981000015','Calle Las Gardenias 615, Lima','D15Q-615','TVS','Neo NX'),
    ('Diego','Cruz','vlc-demo-cliente-16@demo.vlcmotors.test','CE','CE8100016','+51 981000016','Av. Peru 716, Lima','D16R-716','Bajaj','Torito 4T'),
    ('Ximena','Ortiz','vlc-demo-cliente-17@demo.vlcmotors.test','DNI','81000017','+51 981000017','Jr. Ayacucho 817, Lima','D17S-817','Wanxin','W3'),
    ('Martin','Silva','vlc-demo-cliente-18@demo.vlcmotors.test','CE','CE8100018','+51 981000018','Av. Brasil 918, Lima','D18T-918','Zongshen','200 ZS'),
    ('Rosa','Chavez','vlc-demo-cliente-19@demo.vlcmotors.test','DNI','81000019','+51 981000019','Calle Los Olivos 119, Lima','D19U-119','Bajaj','RE 4S'),
    ('Piero','Delgado','vlc-demo-cliente-20@demo.vlcmotors.test','CE','CE8100020','+51 981000020','Jr. Junin 220, Lima','D20V-220','TVS','King Deluxe'),
    ('Brenda','Leon','vlc-demo-cliente-21@demo.vlcmotors.test','DNI','81000021','+51 981000021','Av. Aviacion 321, Lima','D21W-321','Wanxin','W3'),
    ('Hugo','Campos','vlc-demo-cliente-22@demo.vlcmotors.test','CE','CE8100022','+51 981000022','Calle Libertad 422, Lima','D22X-422','Bajaj','Torito 4T'),
    ('Elena','Ramos','vlc-demo-cliente-23@demo.vlcmotors.test','DNI','81000023','+51 981000023','Jr. Moquegua 523, Lima','D23Y-523','Zongshen','200 ZS'),
    ('Oscar','Fuentes','vlc-demo-cliente-24@demo.vlcmotors.test','CE','CE8100024','+51 981000024','Av. Angamos 624, Lima','D24Z-624','TVS','Neo NX')
  ) AS v(nombre, apellido, email, tipo_doc, documento, telefono, direccion, placa, marca, modelo)
), usuarios AS (
  INSERT INTO public.usuarios
    (nombre, apellido, email, dni, tipo_documento, numero_documento, activo, contrasenia, rol, fecha_registro)
  SELECT nombre, apellido, email,
         CASE WHEN tipo_doc = 'DNI' THEN documento ELSE NULL END,
         tipo_doc, documento, TRUE,
         extensions.crypt('DemoVLC2026!', extensions.gen_salt('bf', 10)), 3,
         CURRENT_TIMESTAMP - ((row_number() OVER (ORDER BY email) % 180) || ' days')::interval
  FROM datos
  ON CONFLICT (email) DO UPDATE SET
    nombre = EXCLUDED.nombre, apellido = EXCLUDED.apellido, dni = EXCLUDED.dni,
    tipo_documento = EXCLUDED.tipo_documento, numero_documento = EXCLUDED.numero_documento,
    activo = TRUE, contrasenia = EXCLUDED.contrasenia, rol = 3
  RETURNING id_usuario, email
)
INSERT INTO public.clientes
  (id_usuario, telefono, direccion, placa_mototaxi, marca_mototaxi, modelo_mototaxi)
SELECT u.id_usuario, d.telefono, d.direccion, d.placa, d.marca, d.modelo
FROM usuarios u JOIN datos d USING (email)
ON CONFLICT (id_usuario) DO UPDATE SET
  telefono = EXCLUDED.telefono, direccion = EXCLUDED.direccion,
  placa_mototaxi = EXCLUDED.placa_mototaxi, marca_mototaxi = EXCLUDED.marca_mototaxi,
  modelo_mototaxi = EXCLUDED.modelo_mototaxi;

WITH datos AS (
  SELECT * FROM (VALUES
    ('Marco','Cabrera','vlc-demo-trabajador-01@demo.vlcmotors.test','82000101','Motores'),
    ('Ruben','Espinoza','vlc-demo-trabajador-02@demo.vlcmotors.test','82000102','Electricidad'),
    ('Sofia','Valdez','vlc-demo-trabajador-03@demo.vlcmotors.test','82000103','Frenos y suspension'),
    ('Kevin','Morales','vlc-demo-trabajador-04@demo.vlcmotors.test','82000104','Mantenimiento general'),
    ('Patricia','Rivas','vlc-demo-trabajador-05@demo.vlcmotors.test','82000105','Transmision')
  ) AS v(nombre, apellido, email, documento, especialidad)
), usuarios AS (
  INSERT INTO public.usuarios
    (nombre, apellido, email, dni, tipo_documento, numero_documento, activo, contrasenia, rol, fecha_registro)
  SELECT nombre, apellido, email, documento, 'DNI', documento, TRUE,
         extensions.crypt('DemoVLC2026!', extensions.gen_salt('bf', 10)), 2,
         CURRENT_TIMESTAMP - ((row_number() OVER (ORDER BY email) * 9) || ' days')::interval
  FROM datos
  ON CONFLICT (email) DO UPDATE SET
    nombre = EXCLUDED.nombre, apellido = EXCLUDED.apellido, dni = EXCLUDED.dni,
    tipo_documento = 'DNI', numero_documento = EXCLUDED.numero_documento,
    activo = TRUE, contrasenia = EXCLUDED.contrasenia, rol = 2
  RETURNING id_usuario, email
)
INSERT INTO public.trabajadores (id_usuario, especialidad, disponibilidad)
SELECT u.id_usuario, d.especialidad, TRUE FROM usuarios u JOIN datos d USING (email)
ON CONFLICT (id_usuario) DO UPDATE SET especialidad = EXCLUDED.especialidad, disponibilidad = TRUE;

WITH datos AS (
  SELECT * FROM (VALUES
    ('Admin','Presentacion Uno','vlc-demo-admin-01@demo.vlcmotors.test','83000101'),
    ('Admin','Presentacion Dos','vlc-demo-admin-02@demo.vlcmotors.test','83000102')
  ) AS v(nombre, apellido, email, documento)
), usuarios AS (
  INSERT INTO public.usuarios
    (nombre, apellido, email, dni, tipo_documento, numero_documento, activo, contrasenia, rol, fecha_registro)
  SELECT nombre, apellido, email, documento, 'DNI', documento, TRUE,
         extensions.crypt('DemoVLC2026!', extensions.gen_salt('bf', 10)), 1, CURRENT_TIMESTAMP
  FROM datos
  ON CONFLICT (email) DO UPDATE SET
    nombre = EXCLUDED.nombre, apellido = EXCLUDED.apellido, dni = EXCLUDED.dni,
    tipo_documento = 'DNI', numero_documento = EXCLUDED.numero_documento,
    activo = TRUE, contrasenia = EXCLUDED.contrasenia, rol = 1
  RETURNING id_usuario
)
INSERT INTO public.administradores (id_usuario, nivel_acceso)
SELECT id_usuario, 1 FROM usuarios
ON CONFLICT (id_usuario) DO UPDATE SET nivel_acceso = EXCLUDED.nivel_acceso;

-- 2. CATALOGO: categorias, proveedores, ofertas y servicios variados.
INSERT INTO public.categorias (nombre_categoria, descripcion)
SELECT v.nombre, v.descripcion
FROM (VALUES
  ('Herramientas demo', 'Herramientas manuales y equipos de taller'),
  ('Baterias demo', 'Baterias, bornes y componentes de carga'),
  ('Llantas y camaras demo', 'Llantas y camaras para mototaxi'),
  ('Transmision avanzada demo', 'Cadenas, piñones y kits de transmision'),
  ('Refrigeracion demo', 'Repuestos de enfriamiento y ventilacion'),
  ('Accesorios electricos demo', 'Cableado, luces y accesorios electricos'),
  ('Carroceria demo', 'Espejos, asientos y componentes de carroceria'),
  ('Seguridad demo', 'Cascos, reflectantes y elementos de seguridad')
) AS v(nombre, descripcion)
WHERE NOT EXISTS (SELECT 1 FROM public.categorias c WHERE lower(c.nombre_categoria) = lower(v.nombre));

INSERT INTO public.proveedores (ruc, nombre_proveedor, telefono)
SELECT '206000100' || lpad(n::text, 2, '0'), 'Distribuidora Demo ' || lpad(n::text, 2, '0'),
       '+51 01 555' || lpad((1000 + n)::text, 4, '0')
FROM generate_series(1, 10) AS n
ON CONFLICT (ruc) DO UPDATE SET nombre_proveedor = EXCLUDED.nombre_proveedor, telefono = EXCLUDED.telefono;

INSERT INTO public.ofertas (titulo, descuento, fecha_inicio, fecha_fin)
SELECT 'Oferta Presentacion VLC ' || lpad(n::text, 2, '0'),
       CASE n % 4 WHEN 0 THEN 5 WHEN 1 THEN 10 WHEN 2 THEN 15 ELSE 20 END,
       CURRENT_DATE - ((n % 3) * 15), CURRENT_DATE + (30 + (n * 3))
FROM generate_series(1, 6) AS n
WHERE NOT EXISTS (SELECT 1 FROM public.ofertas o WHERE o.titulo = 'Oferta Presentacion VLC ' || lpad(n::text, 2, '0'));

INSERT INTO public.servicios (nombre_servicio, descripcion_servicio, precio_inicial, duracion_estimada_minutos)
SELECT v.nombre, v.descripcion, v.precio, v.minutos
FROM (VALUES
  ('Servicio demo presentacion 01 - Mantenimiento completo','Inspeccion general, ajuste y mantenimiento preventivo',145.00,90),
  ('Servicio demo presentacion 02 - Cambio de aceite','Cambio de aceite y revision de niveles',58.00,40),
  ('Servicio demo presentacion 03 - Sistema de frenos','Revision y ajuste de frenos',105.00,75),
  ('Servicio demo presentacion 04 - Diagnostico electrico','Prueba de bateria, luces y sistema electrico',82.00,60),
  ('Servicio demo presentacion 05 - Afinamiento','Calibracion y afinamiento de motor',160.00,120),
  ('Servicio demo presentacion 06 - Transmision','Ajuste de cadena y revision de piñones',92.00,60),
  ('Servicio demo presentacion 07 - Revision de bateria','Diagnostico de carga y bornes',48.00,40),
  ('Servicio demo presentacion 08 - Llantas','Inspeccion de llantas y camaras',65.00,45),
  ('Servicio demo presentacion 09 - Embrague','Revision y ajuste del embrague',118.00,90),
  ('Servicio demo presentacion 10 - Suspension','Inspeccion de amortiguadores y suspension',125.00,90),
  ('Servicio demo presentacion 11 - Luces','Revision de luces e instalacion basica',45.00,40),
  ('Servicio demo presentacion 12 - Inspeccion precompra','Evaluacion general del vehiculo',135.00,90)
) AS v(nombre, descripcion, precio, minutos)
WHERE NOT EXISTS (SELECT 1 FROM public.servicios s WHERE s.nombre_servicio = v.nombre);

-- 48 productos con categorias, proveedores y ofertas; stock neto consistente
-- con dos movimientos de entrada/salida agregados más abajo.
WITH serie AS (SELECT generate_series(1, 48) AS n), catalogo AS (
  SELECT n,
    (ARRAY['Aceite sintetico 4T','Pastillas de freno','Bujia de alto rendimiento','Filtro de aire','Kit de arrastre','Cable de freno','Filtro de combustible','Bobina de encendido','Llanta posterior','Bateria 12V','Espejo lateral','Juego de herramientas'])[((n - 1) % 12) + 1] || ' P' || lpad(n::text, 2, '0') AS nombre,
    'VLC-PRES-' || lpad(n::text, 4, '0') AS codigo,
    (ARRAY['Motul','Bajaj','NGK','TVS','Zongshen','Bosch','Dunlop','Universal'])[((n - 1) % 8) + 1] AS marca,
    CASE ((n - 1) % 12) WHEN 0 THEN 38.00 WHEN 1 THEN 46.00 WHEN 2 THEN 28.00 WHEN 3 THEN 34.00 WHEN 4 THEN 118.00 WHEN 5 THEN 20.00 WHEN 6 THEN 18.00 WHEN 7 THEN 72.00 WHEN 8 THEN 145.00 WHEN 9 THEN 165.00 WHEN 10 THEN 32.00 ELSE 85.00 END + ((n % 5) * 1.25) AS precio,
    12 + ((n * 7) % 20) AS stock_inicial,
    10 + ((n * 5) % 15) AS entradas,
    1 + ((n * 3) % 8) AS salidas,
    (ARRAY['Herramientas demo','Baterias demo','Llantas y camaras demo','Transmision avanzada demo','Refrigeracion demo','Accesorios electricos demo','Carroceria demo','Seguridad demo'])[((n - 1) % 8) + 1] AS categoria,
    '206000100' || lpad((((n - 1) % 10) + 1)::text, 2, '0') AS ruc,
    'Oferta Presentacion VLC ' || lpad((((n - 1) % 6) + 1)::text, 2, '0') AS oferta
  FROM serie
)
INSERT INTO public.productos (nombre, codigo_producto, marca, precio_venta, stock, imagen_url, id_categoria, id_proveedor, id_oferta)
SELECT d.nombre, d.codigo, d.marca, d.precio, d.stock_inicial + d.entradas - d.salidas, NULL,
       c.id_categoria, p.id_proveedor, o.id_oferta
FROM catalogo d
JOIN public.categorias c ON c.nombre_categoria = d.categoria
JOIN public.proveedores p ON p.ruc = d.ruc
LEFT JOIN public.ofertas o ON o.titulo = d.oferta
ON CONFLICT (codigo_producto) DO UPDATE SET
  nombre = EXCLUDED.nombre, marca = EXCLUDED.marca, precio_venta = EXCLUDED.precio_venta,
  stock = EXCLUDED.stock, id_categoria = EXCLUDED.id_categoria,
  id_proveedor = EXCLUDED.id_proveedor, id_oferta = EXCLUDED.id_oferta;

-- 3. HISTORIAL: dos movimientos por producto para consultar entradas/salidas.
WITH movimientos AS (
  SELECT p.id_producto, p.codigo_producto, v.cantidad, v.tipo,
         'Presentacion ' || v.tipo || ' de apertura ' || p.codigo_producto AS descripcion,
         CURRENT_TIMESTAMP - (v.dias || ' days')::interval AS fecha
  FROM public.productos p
  CROSS JOIN LATERAL (VALUES
    (10 + ((substring(p.codigo_producto from 10 for 4)::int * 5) % 15), 'ENTRADA', 70),
    (1 + ((substring(p.codigo_producto from 10 for 4)::int * 3) % 8), 'SALIDA', 25)
  ) AS v(cantidad, tipo, dias)
  WHERE p.codigo_producto LIKE 'VLC-PRES-%'
)
INSERT INTO public.historial_stock (cantidad, tipo_movimiento, fecha_movimiento, descripcion, id_producto)
SELECT m.cantidad, m.tipo, m.fecha, m.descripcion, m.id_producto
FROM movimientos m
WHERE NOT EXISTS (SELECT 1 FROM public.historial_stock h WHERE h.descripcion = m.descripcion);

-- 4. CITAS: seis meses con pagos presenciales variados, pendientes de pago,
-- cancelaciones y estados activos. Cada cita se enlaza con cliente/trabajador/servicio.
WITH meses AS (
  SELECT i AS mes,
         (date_trunc('month', CURRENT_DATE)::date - ((5 - i) * INTERVAL '1 month'))::date AS inicio
  FROM generate_series(0, 5) AS g(i)
), patrones AS (
  SELECT m.mes, v.slot,
         LEAST(m.inicio + (v.dia - 1), CURRENT_DATE - 1) AS fecha,
         v.hora::time AS hora, v.servicio, v.cliente, v.trabajador,
         v.estado, v.metodo, v.extra, v.calificacion, v.comentario, v.observacion
  FROM meses m
  CROSS JOIN (VALUES
    (1, 4,  '09:00', 1, 1, 1, 'COMPLETADA', 'EFECTIVO',       0.00, 5, 'Atencion puntual y servicio detallado', 'Mantenimiento preventivo completado'),
    (2, 9,  '10:00', 2, 2, 2, 'COMPLETADA', 'YAPE',           5.00, 4, 'Buena atencion y entrega a tiempo', 'Cambio de aceite realizado'),
    (3, 14, '14:00', 3, 3, 3, 'COMPLETADA', 'PLIN',           0.00, 3, 'Servicio correcto, con oportunidad de mejora', 'Sistema de frenos revisado'),
    (4, 19, '15:00', 4, 4, 4, 'COMPLETADA', 'TARJETA',        8.00, 5, 'Explicaron el trabajo antes de iniciar', 'Diagnostico y reparacion completados'),
    (5, 24, '16:00', 5, 5, 5, 'COMPLETADA', 'TRANSFERENCIA', 10.00, 4, 'Quedo funcionando correctamente', 'Afinamiento finalizado'),
    (6, 26, '11:00', 6, 6, 1, 'COMPLETADA', 'EFECTIVO',       0.00, 5, 'Volvere para el siguiente mantenimiento', 'Transmision ajustada')
  ) AS v(slot, dia, hora, servicio, cliente, trabajador, estado, metodo, extra, calificacion, comentario, observacion)
  UNION ALL
  SELECT m.mes, 7, LEAST(m.inicio + 20, CURRENT_DATE - 1), '09:00'::time, 7,
         ((m.mes + 6) % 24) + 1, ((m.mes + 2) % 5) + 1,
         'COMPLETADA', NULL, 0.00, NULL, NULL, 'Servicio terminado, pago presencial pendiente'
  FROM meses m
  UNION ALL
  SELECT m.mes, 8, LEAST(m.inicio + 22, CURRENT_DATE - 1), '16:00'::time, 8,
         ((m.mes + 10) % 24) + 1, ((m.mes + 3) % 5) + 1,
         'CANCELADA', NULL, 0.00, NULL, NULL, 'Cita cancelada por el cliente'
  FROM meses m
  UNION ALL
  SELECT 6, 9, CURRENT_DATE + 3, '10:00'::time, 9, 21, 2,
         'PENDIENTE', NULL, 0.00, NULL, NULL, 'Cita futura pendiente de atencion'
  UNION ALL
  SELECT 6, 10, CURRENT_DATE, '14:00'::time, 10, 22, 3,
         'EN_PROGRESO', NULL, 0.00, NULL, NULL, 'Servicio actualmente en proceso'
  UNION ALL
  SELECT 6, 11, CURRENT_DATE - 2, '11:00'::time, 11, 23, 4,
         'COMPLETADA', NULL, 0.00, NULL, NULL, 'Servicio completado, falta confirmar pago'
  UNION ALL
  SELECT 6, 12, CURRENT_DATE - 7, '16:00'::time, 12, 24, 5,
         'CANCELADA', NULL, 0.00, NULL, NULL, 'Cita cancelada antes de iniciar el servicio'
), datos AS (
  SELECT p.*, cl.id_usuario AS id_cliente, tr.id_usuario AS id_trabajador,
         s.id_servicio, s.precio_inicial,
         CASE WHEN p.metodo IS NOT NULL THEN s.precio_inicial + p.extra ELSE NULL END AS monto_pagado,
         CASE WHEN p.metodo IS NOT NULL THEN p.fecha::timestamp + INTERVAL '1 day 12 hours' ELSE NULL END AS fecha_pago,
         'SEED-PRES-CITA-' || lpad(p.mes::text, 2, '0') || '-' || lpad(p.slot::text, 2, '0') AS marca
  FROM patrones p
  JOIN public.usuarios uc ON uc.email = 'vlc-demo-cliente-' || lpad(p.cliente::text, 2, '0') || '@demo.vlcmotors.test'
  JOIN public.clientes cl ON cl.id_usuario = uc.id_usuario
  JOIN public.usuarios ut ON ut.email = 'vlc-demo-trabajador-' || lpad(p.trabajador::text, 2, '0') || '@demo.vlcmotors.test'
  JOIN public.trabajadores tr ON tr.id_usuario = ut.id_usuario
  JOIN public.servicios s ON s.nombre_servicio = 'Servicio demo presentacion ' || lpad(p.servicio::text, 2, '0') || ' - ' ||
       (ARRAY['Mantenimiento completo','Cambio de aceite','Sistema de frenos','Diagnostico electrico','Afinamiento','Transmision','Revision de bateria','Llantas','Embrague','Suspension','Luces','Inspeccion precompra'])[p.servicio]
), insertadas AS (
  INSERT INTO public.citas
    (fecha, hora, estado, observaciones, monto_inicial, pago_registrado, monto_pagado,
     metodo_pago, fecha_pago, fecha_creacion, fecha_modificacion, id_cliente, id_trabajador, id_servicio)
  SELECT d.fecha, d.hora, d.estado, d.observacion || ' [' || d.marca || ']', d.precio_inicial,
         d.metodo IS NOT NULL, d.monto_pagado, d.metodo, d.fecha_pago,
         d.fecha::timestamp, d.fecha::timestamp, d.id_cliente, d.id_trabajador, d.id_servicio
  FROM datos d
  WHERE NOT EXISTS (SELECT 1 FROM public.citas c WHERE c.observaciones LIKE '%' || d.marca || '%')
  RETURNING id_cita, fecha, observaciones
)
INSERT INTO public.reseñas (calificacion, comentario, fecha_reseña, id_cita)
SELECT d.calificacion, d.comentario, i.fecha, i.id_cita
FROM insertadas i
JOIN datos d ON i.observaciones LIKE '%' || d.marca || '%'
WHERE d.calificacion IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.reseñas r WHERE r.id_cita = i.id_cita);

-- 5. PEDIDOS: 48 pedidos (24 recogidos/pagados, 12 pendientes, 12 cancelados),
-- con dos lineas de productos por pedido. Los importes coinciden con las lineas.
WITH meses AS (
  SELECT i AS mes,
         (date_trunc('month', CURRENT_DATE)::date - ((5 - i) * INTERVAL '1 month'))::date AS inicio
  FROM generate_series(0, 5) AS g(i)
), pedidos_base AS (
  SELECT m.mes, v.slot, LEAST(m.inicio + (v.dia - 1), CURRENT_DATE - 1) AS fecha,
         ((m.mes * 8 + v.slot - 1) % 24) + 1 AS cliente,
         ((m.mes + v.slot - 1) % 5) + 1 AS trabajador,
         v.estado,
         'VLC-PRES-' || lpad((((m.mes * 8 + v.slot * 2 - 1) % 48) + 1)::text, 4, '0') AS codigo1,
         'VLC-PRES-' || lpad((((m.mes * 8 + v.slot * 2 + 12) % 48) + 1)::text, 4, '0') AS codigo2,
         1 + ((m.mes + v.slot) % 3) AS cantidad1,
         1 + ((m.mes + v.slot + 1) % 2) AS cantidad2
  FROM meses m
  CROSS JOIN (VALUES
    (1, 6,  'RECOGIDO'), (2, 10, 'RECOGIDO'), (3, 14, 'RECOGIDO'), (4, 18, 'RECOGIDO'),
    (5, 22, 'PENDIENTE'), (6, 24, 'PENDIENTE'), (7, 25, 'CANCELADO'), (8, 26, 'CANCELADO')
  ) AS v(slot, dia, estado)
), datos AS (
  SELECT b.*, cl.id_usuario AS id_cliente, tr.id_usuario AS id_trabajador,
         p1.id_producto AS id_producto1, p1.precio_venta AS precio1,
         p2.id_producto AS id_producto2, p2.precio_venta AS precio2,
         b.cantidad1 * p1.precio_venta + b.cantidad2 * p2.precio_venta AS total
  FROM pedidos_base b
  JOIN public.usuarios uc ON uc.email = 'vlc-demo-cliente-' || lpad(b.cliente::text, 2, '0') || '@demo.vlcmotors.test'
  JOIN public.clientes cl ON cl.id_usuario = uc.id_usuario
  JOIN public.usuarios ut ON ut.email = 'vlc-demo-trabajador-' || lpad(b.trabajador::text, 2, '0') || '@demo.vlcmotors.test'
  JOIN public.trabajadores tr ON tr.id_usuario = ut.id_usuario
  JOIN public.productos p1 ON p1.codigo_producto = b.codigo1
  JOIN public.productos p2 ON p2.codigo_producto = b.codigo2
), nuevas AS (
  INSERT INTO public.ordenes_compra
    (fecha_reserva, fecha_pago, monto_total, estado_recojo, id_cliente, id_trabajador)
  SELECT d.fecha,
         CASE WHEN d.estado = 'RECOGIDO' THEN d.fecha::timestamp + INTERVAL '1 day 12 hours' ELSE NULL END,
         d.total, d.estado, d.id_cliente, d.id_trabajador
  FROM datos d
  WHERE NOT EXISTS (
    SELECT 1 FROM public.ordenes_compra o
    WHERE o.id_cliente = d.id_cliente AND o.fecha_reserva = d.fecha AND o.estado_recojo = d.estado
  )
  RETURNING id_reserva, fecha_reserva, id_cliente, estado_recojo
)
INSERT INTO public.items_comprados (cantidad, precio_unitario_historial, id_reserva, id_producto)
SELECT d.cantidad1, d.precio1, n.id_reserva, d.id_producto1
FROM nuevas n JOIN datos d
  ON d.id_cliente = n.id_cliente AND d.fecha = n.fecha_reserva AND d.estado = n.estado_recojo
UNION ALL
SELECT d.cantidad2, d.precio2, n.id_reserva, d.id_producto2
FROM nuevas n JOIN datos d
  ON d.id_cliente = n.id_cliente AND d.fecha = n.fecha_reserva AND d.estado = n.estado_recojo;

COMMIT;

-- Resumen para confirmar el volumen insertado y comprobar las relaciones.
SELECT 'Clientes demo' AS tabla, COUNT(*) AS filas
FROM public.clientes c JOIN public.usuarios u USING (id_usuario)
WHERE u.email LIKE 'vlc-demo-cliente-%@demo.vlcmotors.test'
UNION ALL
SELECT 'Trabajadores demo', COUNT(*)
FROM public.trabajadores t JOIN public.usuarios u USING (id_usuario)
WHERE u.email LIKE 'vlc-demo-trabajador-%@demo.vlcmotors.test'
UNION ALL
SELECT 'Administradores demo', COUNT(*)
FROM public.administradores a JOIN public.usuarios u USING (id_usuario)
WHERE u.email LIKE 'vlc-demo-admin-%@demo.vlcmotors.test'
UNION ALL
SELECT 'Productos demo', COUNT(*) FROM public.productos WHERE codigo_producto LIKE 'VLC-PRES-%'
UNION ALL
SELECT 'Movimientos demo', COUNT(*) FROM public.historial_stock WHERE descripcion LIKE 'Presentacion % VLC-PRES-%'
UNION ALL
SELECT 'Citas demo', COUNT(*) FROM public.citas WHERE observaciones LIKE '%[SEED-PRES-CITA-%'
UNION ALL
SELECT 'Reseñas de citas demo', COUNT(*) FROM public.reseñas r
JOIN public.citas c USING (id_cita) WHERE c.observaciones LIKE '%[SEED-PRES-CITA-%'
UNION ALL
SELECT 'Pedidos demo', COUNT(*) FROM public.ordenes_compra o
JOIN public.clientes c ON c.id_usuario = o.id_cliente
JOIN public.usuarios u ON u.id_usuario = c.id_usuario
WHERE u.email LIKE 'vlc-demo-cliente-%@demo.vlcmotors.test'
UNION ALL
SELECT 'Lineas de pedido demo', COUNT(*) FROM public.items_comprados i
JOIN public.ordenes_compra o USING (id_reserva)
JOIN public.clientes c ON c.id_usuario = o.id_cliente
JOIN public.usuarios u ON u.id_usuario = c.id_usuario
WHERE u.email LIKE 'vlc-demo-cliente-%@demo.vlcmotors.test';

-- Credenciales de las cuentas nuevas: contraseña DemoVLC2026!
-- Clientes:    vlc-demo-cliente-01@demo.vlcmotors.test ... vlc-demo-cliente-24@demo.vlcmotors.test
-- Trabajadores: vlc-demo-trabajador-01@demo.vlcmotors.test ... vlc-demo-trabajador-05@demo.vlcmotors.test
-- Admins:      vlc-demo-admin-01@demo.vlcmotors.test, vlc-demo-admin-02@demo.vlcmotors.test
