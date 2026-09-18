# Beta funcional — Entrega Escolar

## Flujo obligatorio
DETECTADO → PREPARAR → EN_TRÁNSITO → LISTO → POSICIÓN_ASIGNADA → VERIFICANDO → ENTREGADO → CERRADO

Estados alternos: INCIDENCIA, CANCELADO, BLOQUEADO.

## Reglas de seguridad
- NFC/RFID/QR identifica una solicitud; nunca autoriza por sí solo la entrega de un menor.
- La entrega exige verificación humana de una persona autorizada.
- Una solicitud ENTREGADA o CERRADA no puede volver a entregarse.
- Cada transición debe generar un evento de auditoría.
- Las incidencias salen del flujo rápido y no deben bloquear una posición.
- Hermanos se agrupan por familia cuando sea posible.
- La asignación de posición ocurre preferentemente cuando todos los alumnos de la familia estén LISTOS.
- Las operaciones futuras offline deberán ser idempotentes y reconciliables.

## Roles iniciales
- ADMIN: configuración, usuarios, auditoría y reportes.
- CASETA: identificación y validación de llegada.
- PREPARADOR: prepara alumnos y marca LISTO/INCIDENCIA.
- ENTREGA: verifica autorizado y confirma entrega.
- SUPERVISOR: resuelve incidencias y overrides auditados.

## Beta 1
1. Separar identificación de autorización.
2. Implementar solicitudes de salida y máquina de estados.
3. Bloqueo de doble entrega.
4. Familias, hermanos y autorizados.
5. Posiciones de entrega configurables.
6. Incidencias.
7. Bitácora de auditoría.
8. Datos sintéticos para pruebas.
9. Pruebas de concurrencia, duplicados y recuperación.

## Criterios críticos
- 0 entregas dobles en pruebas.
- 0 entregas sin verificación de autorizado.
- Una incidencia no bloquea el carril principal.
- Toda entrega conserva trazabilidad.
