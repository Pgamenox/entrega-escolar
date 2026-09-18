// Dominio central de Entrega Escolar.
// Sin dependencias: puede usarse desde el prototipo actual y migrarse después a backend.

export const STATES = Object.freeze({
  DETECTADO: "DETECTADO",
  PREPARAR: "PREPARAR",
  EN_TRANSITO: "EN_TRANSITO",
  LISTO: "LISTO",
  POSICION_ASIGNADA: "POSICION_ASIGNADA",
  VERIFICANDO: "VERIFICANDO",
  ENTREGADO: "ENTREGADO",
  CERRADO: "CERRADO",
  INCIDENCIA: "INCIDENCIA",
  CANCELADO: "CANCELADO",
  BLOQUEADO: "BLOQUEADO"
});

const ALLOWED = Object.freeze({
  DETECTADO: ["PREPARAR", "INCIDENCIA", "CANCELADO", "BLOQUEADO"],
  PREPARAR: ["EN_TRANSITO", "LISTO", "INCIDENCIA", "CANCELADO", "BLOQUEADO"],
  EN_TRANSITO: ["LISTO", "INCIDENCIA", "CANCELADO", "BLOQUEADO"],
  LISTO: ["POSICION_ASIGNADA", "INCIDENCIA", "CANCELADO", "BLOQUEADO"],
  POSICION_ASIGNADA: ["VERIFICANDO", "LISTO", "INCIDENCIA", "CANCELADO", "BLOQUEADO"],
  VERIFICANDO: ["ENTREGADO", "INCIDENCIA", "BLOQUEADO"],
  ENTREGADO: ["CERRADO"],
  CERRADO: [],
  INCIDENCIA: ["PREPARAR", "LISTO", "CANCELADO", "BLOQUEADO"],
  CANCELADO: [],
  BLOQUEADO: []
});

export function canTransition(from, to) {
  return Boolean(ALLOWED[from]?.includes(to));
}

export function transition(request, to, actor, meta = {}) {
  if (!request?.id) throw new Error("Solicitud inválida");
  if (!actor?.id || !actor?.role) throw new Error("Actor requerido");
  if (!canTransition(request.state, to)) {
    throw new Error(`Transición inválida: ${request.state} → ${to}`);
  }
  const now = new Date().toISOString();
  return {
    ...request,
    state: to,
    updatedAt: now,
    audit: [
      ...(request.audit || []),
      { at: now, from: request.state, to, actorId: actor.id, role: actor.role, ...meta }
    ]
  };
}

export function verifyRelease({ request, authorizedPersonId, verifiedBy }) {
  if (!request?.id) throw new Error("Solicitud inválida");
  if (request.state !== STATES.VERIFICANDO) throw new Error("La solicitud no está en verificación");
  if (request.releasedAt || request.state === STATES.ENTREGADO || request.state === STATES.CERRADO) {
    throw new Error("Entrega duplicada bloqueada");
  }
  if (!authorizedPersonId) throw new Error("Debe verificarse una persona autorizada");
  if (!verifiedBy?.id) throw new Error("Debe registrarse quién verificó");

  const now = new Date().toISOString();
  return {
    ...request,
    state: STATES.ENTREGADO,
    releasedAt: now,
    authorizedPersonId,
    verifiedBy: verifiedBy.id,
    updatedAt: now,
    audit: [
      ...(request.audit || []),
      {
        at: now,
        from: STATES.VERIFICANDO,
        to: STATES.ENTREGADO,
        actorId: verifiedBy.id,
        role: verifiedBy.role,
        authorizedPersonId,
        event: "RELEASE_CONFIRMED"
      }
    ]
  };
}

export function createDismissalRequest({ id, familyId, studentIds, source, tokenId }) {
  if (!id || !familyId || !Array.isArray(studentIds) || studentIds.length === 0) {
    throw new Error("Datos incompletos");
  }
  const now = new Date().toISOString();
  return {
    id,
    familyId,
    studentIds: [...new Set(studentIds)],
    source, // NFC | RFID | QR | MANUAL
    tokenId: tokenId || null,
    state: STATES.DETECTADO,
    createdAt: now,
    updatedAt: now,
    releasedAt: null,
    audit: [{ at: now, from: null, to: STATES.DETECTADO, event: "REQUEST_CREATED" }]
  };
}
