import { STATES, canTransition, transition, verifyRelease, createDismissalRequest } from "../src/domain/dismissal.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function expectThrow(fn, label) {
  let threw = false;
  try { fn(); } catch { threw = true; }
  assert(threw, label);
}

const actor = { id: "staff-1", role: "ENTREGA" };
let req = createDismissalRequest({
  id: "req-1",
  familyId: "fam-1",
  studentIds: ["alu-1", "alu-2"],
  source: "NFC",
  tokenId: "NFC-101"
});

assert(req.state === STATES.DETECTADO, "Debe iniciar DETECTADO");
assert(canTransition(STATES.DETECTADO, STATES.PREPARAR), "Debe permitir preparar");
assert(!canTransition(STATES.DETECTADO, STATES.ENTREGADO), "NFC no puede entregar directamente");
expectThrow(() => transition(req, STATES.ENTREGADO, actor), "Debe bloquear salto directo a ENTREGADO");

req = transition(req, STATES.PREPARAR, { id: "prep-1", role: "PREPARADOR" });
req = transition(req, STATES.LISTO, { id: "prep-1", role: "PREPARADOR" });
req = transition(req, STATES.POSICION_ASIGNADA, { id: "sup-1", role: "SUPERVISOR" }, { bay: 3 });
req = transition(req, STATES.VERIFICANDO, actor);

expectThrow(
  () => verifyRelease({ request: req, authorizedPersonId: null, verifiedBy: actor }),
  "Debe bloquear entrega sin persona autorizada"
);

const delivered = verifyRelease({
  request: req,
  authorizedPersonId: "auth-1",
  verifiedBy: actor
});
assert(delivered.state === STATES.ENTREGADO, "Debe quedar ENTREGADO");
assert(Boolean(delivered.releasedAt), "Debe registrar releasedAt");
expectThrow(
  () => verifyRelease({ request: delivered, authorizedPersonId: "auth-1", verifiedBy: actor }),
  "Debe bloquear doble entrega"
);

console.log("OK: pruebas críticas de máquina de estados superadas");
