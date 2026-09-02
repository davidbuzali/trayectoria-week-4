import { useCallback, useEffect, useMemo, useState } from "react";
import {
  demoCase,
  proposals,
  type CourseProposal,
  type ProposalReview,
  type ProposalStatus,
} from "./data";
import {
  MAX_RATIONALE_LENGTH,
  calculateRoute,
  canIssueDecision,
  confirmedCreditTotal,
  institutionalDecisionBlockers,
  validateRationale,
  type ReviewMap,
} from "./logic";

const statusText: Record<ProposalStatus, string> = {
  pending: "Pendiente de revisión",
  confirmed: "Confirmada por evaluadora",
  returned: "Devuelta por evidencia",
};

type ActiveAction = {
  id: string;
  status: ProposalReview["status"];
};

type AiMode = "simulated" | "live";

type RouteResult = ReturnType<typeof calculateRoute>;

function RouteCard({
  title,
  institution,
  route,
  tuitionPerSemester,
  affordability,
  note,
}: {
  title: string;
  institution: string;
  route: RouteResult;
  tuitionPerSemester: number;
  affordability: number;
  note: string;
}) {
  const withinBudget = tuitionPerSemester <= affordability;
  const money = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
  return (
    <article className="route-card">
      <p className="eyebrow">{title}</p>
      <h3>{institution}</h3>
      <div className="route-metrics">
        <div><strong>{route.acceptedCredits}</strong><span>créditos reconocidos</span></div>
        <div><strong>{route.remainingCredits}</strong><span>créditos restantes</span></div>
        <div><strong>{route.estimatedSemesters}</strong><span>semestres estimados</span></div>
      </div>
      <dl className="cost-facts">
        <div><dt>Colegiatura por semestre</dt><dd>{money.format(tuitionPerSemester)}</dd></div>
        <div><dt>Colegiatura restante estimada</dt><dd>{money.format(route.projectedTuition)}</dd></div>
        <div><dt>Referencia familiar</dt><dd>{money.format(affordability)} por semestre</dd></div>
      </dl>
      <p className={`budget-note ${withinBudget ? "within" : "over"}`}>
        {withinBudget ? "Dentro de la referencia económica declarada." : `Supera la referencia en ${money.format(tuitionPerSemester - affordability)} por semestre.`}
      </p>
      <p className="route-note">{note}</p>
    </article>
  );
}

export default function App() {
  const [view, setView] = useState<"evaluator" | "student">("evaluator");
  const [displayProposals, setDisplayProposals] = useState<readonly CourseProposal[]>(proposals);
  const [reviews, setReviews] = useState<ReviewMap>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<ActiveAction | null>(null);
  const [rationale, setRationale] = useState("");
  const [rationaleError, setRationaleError] = useState<string | null>(null);
  const [decisionIssuedAt, setDecisionIssuedAt] = useState<string | null>(null);
  const [aiMode, setAiMode] = useState<AiMode>("simulated");
  const [aiLoading, setAiLoading] = useState(false);
  const [liveMessage, setLiveMessage] = useState("Tres propuestas esperan revisión humana.");
  const [events, setEvents] = useState<string[]>(["Expediente de demostración abierto."]);

  const reviewed = useMemo(
    () => displayProposals.filter((proposal) => reviews[proposal.id]).length,
    [displayProposals, reviews],
  );
  const blockers = useMemo(
    () => institutionalDecisionBlockers(displayProposals, reviews),
    [displayProposals, reviews],
  );
  const acceptedTransferCredits = useMemo(
    () => confirmedCreditTotal(displayProposals, reviews, demoCase.previouslyConfirmedTransferCredits),
    [displayProposals, reviews],
  );
  const currentRoute = useMemo(() => calculateRoute({
    acceptedCredits: demoCase.currentCredits,
    degreeCredits: demoCase.destinationCredits,
    creditsPerSemester: demoCase.assumptions.creditsPerSemester,
    tuitionPerSemester: demoCase.assumptions.currentTuitionPerSemester,
  }), []);
  const transferRoute = useMemo(() => calculateRoute({
    acceptedCredits: acceptedTransferCredits,
    degreeCredits: demoCase.destinationCredits,
    creditsPerSemester: demoCase.assumptions.creditsPerSemester,
    tuitionPerSemester: demoCase.assumptions.transferTuitionPerSemester,
  }), [acceptedTransferCredits]);

  const applyReview = useCallback(
    (proposalId: string, status: ProposalReview["status"], reason: string) => {
      const error = validateRationale(reason);
      const proposal = displayProposals.find((item) => item.id === proposalId);
      if (!proposal) return { ok: false, message: "La propuesta indicada no existe." };
      if (error) return { ok: false, message: error };

      const review: ProposalReview = {
        status,
        rationale: reason.trim(),
        evaluatorName: "Laura M. · evaluadora simulada",
        decidedAt: new Intl.DateTimeFormat("es-MX", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date()),
      };
      setReviews((current) => ({ ...current, [proposalId]: review }));
      setDecisionIssuedAt(null);
      const action = status === "confirmed" ? "confirmó" : "devolvió";
      const message = `${proposalId}: Laura M. ${action} la propuesta con una razón registrada.`;
      setEvents((current) => [message, ...current]);
      setLiveMessage(message);
      return { ok: true, message };
    },
    [displayProposals],
  );

  useEffect(() => {
    if (!document.modelContext?.registerTool) return;
    document.modelContext.registerTool({
      name: "review_course_proposal",
      description: "Registra una revisión humana simulada sobre una propuesta de equivalencia del expediente T-014.",
      inputSchema: {
        type: "object",
        properties: {
          proposalId: { type: "string", enum: proposals.map((proposal) => proposal.id) },
          decision: { type: "string", enum: ["confirmed", "returned"] },
          rationale: { type: "string", minLength: 1, maxLength: MAX_RATIONALE_LENGTH },
        },
        required: ["proposalId", "decision", "rationale"],
      },
      execute: async (input: unknown) => {
        const value = input as { proposalId?: string; decision?: string; rationale?: string };
        if (
          !value.proposalId ||
          !["confirmed", "returned"].includes(value.decision ?? "") ||
          typeof value.rationale !== "string"
        ) {
          return { ok: false, message: "Entrada incompleta para la revisión." };
        }
        return applyReview(
          value.proposalId,
          value.decision as ProposalReview["status"],
          value.rationale,
        );
      },
    });
  }, [applyReview]);

  function beginReview(id: string, status: ProposalReview["status"]) {
    const existing = reviews[id];
    setActiveAction({ id, status });
    setRationale(existing?.rationale ?? "");
    setRationaleError(null);
  }

  function saveReview() {
    if (!activeAction) return;
    const result = applyReview(activeAction.id, activeAction.status, rationale);
    if (!result.ok) {
      setRationaleError(result.message);
      return;
    }
    setActiveAction(null);
    setRationale("");
    setRationaleError(null);
  }

  async function refreshAiProposals() {
    setAiLoading(true);
    setLiveMessage("Actualizando propuestas; las decisiones humanas no cambiarán.");
    try {
      const response = await fetch("/api/propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalIds: displayProposals.map((proposal) => proposal.id) }),
      });
      if (!response.ok) throw new Error("API no disponible");
      const payload = (await response.json()) as {
        mode?: AiMode;
        proposals?: Array<Pick<CourseProposal, "id" | "aiExplanation" | "missingEvidence">>;
      };
      if (payload.proposals) {
        setDisplayProposals((current) => current.map((proposal) => {
          const update = payload.proposals?.find((item) => item.id === proposal.id);
          return update ? { ...proposal, ...update } : proposal;
        }));
      }
      setAiMode(payload.mode === "live" ? "live" : "simulated");
      setLiveMessage("Propuestas actualizadas. La revisión humana se conservó.");
    } catch {
      setAiMode("simulated");
      setDisplayProposals(proposals);
      setLiveMessage("Vista local: se conservaron las propuestas simuladas del expediente.");
    } finally {
      setAiLoading(false);
    }
  }

  function issueDecision() {
    if (!canIssueDecision(displayProposals, reviews)) return;
    const issued = new Intl.DateTimeFormat("es-MX", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date());
    setDecisionIssuedAt(issued);
    setEvents((current) => [`Decisión institucional simulada emitida el ${issued}.`, ...current]);
    setLiveMessage("Decisión institucional emitida. El cálculo ya puede usar solo créditos confirmados.");
  }

  if (view === "student") {
    const returned = displayProposals.filter((proposal) => reviews[proposal.id]?.status === "returned");
    return (
      <main>
        <header className="topbar">
          <a className="brand" href="#student-view" aria-label="Trayectoria, vista del estudiante">
            <span className="brand-mark" aria-hidden="true">T</span>
            <span><strong>TRAYECTORIA</strong><small>Vista del estudiante</small></span>
          </a>
          <p className="prototype-label"><span /> Prototipo académico · datos inventados</p>
        </header>
        <nav className="contextbar" aria-label="Contexto del expediente">
          <div><span>Expediente</span><strong>{demoCase.id}</strong></div>
          <div><span>Estudiante</span><strong>{demoCase.student}</strong></div>
          <div><span>Evidencia calculada</span><strong>{demoCase.assumptions.evidenceDate}</strong></div>
          <button type="button" onClick={() => setView("evaluator")}>Volver a evaluación <span aria-hidden="true">↗</span></button>
        </nav>
        <section className="student-view" id="student-view">
          <p className="eyebrow">Decisión informada, no decisión automática</p>
          <h1>Diego conserva la elección.</h1>
          <p className="student-intro">Trayectoria muestra consecuencias verificables bajo las mismas suposiciones. No recomienda una institución y no elimina opciones por costo.</p>
          {!decisionIssuedAt ? (
            <div className="waiting-state">
              <span aria-hidden="true">⌁</span>
              <div><h2>La comparación todavía no está disponible.</h2><p>Una institución debe resolver todas las equivalencias y emitir una decisión escrita. Hasta entonces, ningún crédito propuesto entra al cálculo.</p></div>
            </div>
          ) : (
            <>
              <div className="student-decision-note"><strong>Decisión institucional simulada emitida</strong><span>{decisionIssuedAt} · {acceptedTransferCredits} créditos reconocidos para la ruta de transferencia</span></div>
              <div className="route-grid" aria-label="Dos rutas calculadas con el mismo peso">
                <RouteCard title="Permanecer" institution={demoCase.currentInstitution} route={currentRoute} tuitionPerSemester={demoCase.assumptions.currentTuitionPerSemester} affordability={demoCase.assumptions.affordabilityPerSemester} note="No hay apoyo verificado en el expediente; la brecha económica permanece visible y la ruta no se descarta." />
                <RouteCard title="Transferencia" institution={demoCase.destinationInstitution} route={transferRoute} tuitionPerSemester={demoCase.assumptions.transferTuitionPerSemester} affordability={demoCase.assumptions.affordabilityPerSemester} note="Solo incorpora créditos confirmados en la decisión institucional; las propuestas devueltas cuentan como cero." />
              </div>
              {returned.length > 0 && <div className="returned-summary"><strong>Equivalencias no incorporadas</strong><ul>{returned.map((proposal) => <li key={proposal.id}>{proposal.sourceCourse.name}: {reviews[proposal.id]?.rationale}</li>)}</ul></div>}
              <details className="assumptions"><summary>Suposiciones y límites del cálculo</summary><ul><li>{demoCase.assumptions.creditsPerSemester} créditos cursados por semestre.</li><li>Colegiaturas constantes; no incluye inflación, becas, transporte ni costo de vida.</li><li>La referencia familiar es declarada, no inferida.</li><li>Los tiempos son estimaciones aritméticas, no garantías académicas.</li></ul></details>
              <div className="agency-note"><strong>También puedes rechazar ambas rutas.</strong><p>La información sirve para preguntar, negociar y decidir; no reemplaza tu criterio ni crea una obligación.</p></div>
            </>
          )}
        </section>
        <footer><span>Trayectoria · prototipo de verificación</span><span>Sin ranking · sin destino predicho · con evidencia corregible</span></footer>
      </main>
    );
  }

  return (
    <main>
      <div className="sr-only" aria-live="polite">{liveMessage}</div>
      <header className="topbar">
        <a className="brand" href="#expediente" aria-label="Trayectoria, inicio">
          <span className="brand-mark" aria-hidden="true">T</span>
          <span><strong>TRAYECTORIA</strong><small>Verificación institucional</small></span>
        </a>
        <p className="prototype-label"><span /> Prototipo académico · datos inventados</p>
      </header>

      <nav className="contextbar" aria-label="Contexto del expediente">
        <div><span>Expediente</span><strong>{demoCase.id}</strong></div>
        <div><span>Institución evaluadora</span><strong>{demoCase.destinationInstitution} · simulada</strong></div>
        <div><span>Fecha límite del estudiante</span><strong>{demoCase.paymentDeadline}</strong></div>
        <button type="button" onClick={() => setView("student")}>Vista de Diego <span aria-hidden="true">↗</span></button>
      </nav>

      <div className="shell" id="expediente">
        <aside className="case-rail" aria-labelledby="student-name">
          <p className="eyebrow">Caso de práctica</p>
          <h1 id="student-name">{demoCase.student}</h1>
          <p className="lead">{demoCase.age} años · {demoCase.program} · primera generación universitaria</p>
          <dl className="case-facts">
            <div><dt>Institución actual</dt><dd>{demoCase.currentInstitution}</dd></div>
            <div><dt>Créditos documentados</dt><dd>{demoCase.currentCredits}</dd></div>
            <div><dt>Prioridad declarada</dt><dd>{demoCase.priority}</dd></div>
          </dl>
          <div className="boundary-note">
            <strong>La decisión sigue siendo de Diego.</strong>
            <p>Este espacio verifica evidencia. No mide potencial, no ordena rutas y no decide admisiones.</p>
          </div>
          <button className="text-button" type="button" onClick={refreshAiProposals} disabled={aiLoading}>
            {aiLoading ? "Actualizando…" : "Actualizar propuestas de IA"}
          </button>
          <small className="mode-note">Modo de IA: {aiMode === "live" ? "API activa" : "simulación controlada"}</small>
        </aside>

        <section className="workspace" aria-labelledby="workspace-title">
          <div className="workspace-heading">
            <div>
              <p className="eyebrow">Revisión activa · {reviewed} de {displayProposals.length} resueltas</p>
              <h2 id="workspace-title">Confirma la evidencia, no la predicción</h2>
              <p>La IA propuso coincidencias entre cursos. Una persona autorizada debe aceptar o devolver cada una antes de emitir una decisión institucional.</p>
            </div>
            <span className={`status-pill ${decisionIssuedAt ? "issued" : ""}`}><i /> {decisionIssuedAt ? "Decisión emitida" : "Revisión humana pendiente"}</span>
          </div>

          <ol className="process" aria-label="Flujo de verificación">
            <li className="done"><span>1</span><div><strong>Propuesta de IA</strong><small>Completada · no vinculante</small></div></li>
            <li className={reviewed === displayProposals.length ? "done" : "active"}><span>2</span><div><strong>Revisión humana</strong><small>{reviewed === displayProposals.length ? "Completada" : "En curso"}</small></div></li>
            <li className={decisionIssuedAt ? "done" : reviewed === displayProposals.length ? "active" : ""}><span>3</span><div><strong>Decisión escrita</strong><small>{decisionIssuedAt ? "Emitida" : "Aún no emitida"}</small></div></li>
            <li><span>4</span><div><strong>Cálculo de ruta</strong><small>{decisionIssuedAt ? "Listo para abrir" : "Bloqueado"}</small></div></li>
          </ol>

          <div className="section-label">
            <div><p className="eyebrow">Coincidencias propuestas</p><h3>Curso por curso</h3></div>
            <p><span>✦</span> La similitud organiza la revisión; no demuestra equivalencia.</p>
          </div>

          <div className="match-list">
            {displayProposals.map((proposal) => {
              const review = reviews[proposal.id];
              const status = review?.status ?? proposal.status;
              const isEditing = activeAction?.id === proposal.id;
              const isExpanded = expanded === proposal.id;
              return (
                <article className={`match-card ${status}`} key={proposal.id}>
                  <div className="match-topline"><span>{proposal.id}</span><span className="ai-chip">✦ {aiMode === "live" ? "PROPUESTA DE IA · API" : "PROPUESTA DE IA SIMULADA"}</span><span className={`review-chip ${status}`}>{statusText[status]}</span></div>
                  <div className="course-pair">
                    <div><small>Curso de origen</small><strong>{proposal.sourceCourse.name}</strong><span>{proposal.sourceCourse.code} · {proposal.sourceCourse.credits} créditos</span></div>
                    <b aria-hidden="true">→</b>
                    <div><small>Curso candidato</small><strong>{proposal.targetCourse.name}</strong><span>{proposal.targetCourse.code} · {proposal.targetCourse.credits} créditos</span></div>
                  </div>
                  <div className="ai-explanation"><span aria-hidden="true">✦</span><p><strong>Lectura provisional de IA.</strong> {proposal.aiExplanation}</p></div>
                  <div className="evidence-line"><span>Fuente verificable</span><strong>{proposal.sourceDocument}</strong><small>{proposal.evidenceDate}</small><button type="button" aria-expanded={isExpanded} onClick={() => setExpanded(isExpanded ? null : proposal.id)}>{isExpanded ? "Ocultar" : "Ver evidencia"}</button></div>
                  {isExpanded && (
                    <div className="evidence-detail">
                      <div><strong>Contenido documentado</strong><ul>{proposal.contentEvidence.map((item) => <li key={item}>{item}</li>)}</ul></div>
                      <div><strong>Evidencia faltante</strong>{proposal.missingEvidence.length ? <ul className="missing">{proposal.missingEvidence.map((item) => <li key={item}>{item}</li>)}</ul> : <p>No se identificó evidencia faltante en esta demostración.</p>}</div>
                    </div>
                  )}
                  {review && !isEditing && <div className="review-record"><strong>Razón institucional</strong><p>{review.rationale}</p><small>{review.evaluatorName} · {review.decidedAt}</small></div>}
                  {isEditing ? (
                    <div className="rationale-form">
                      <label htmlFor={`reason-${proposal.id}`}>{activeAction.status === "confirmed" ? "Razón para confirmar" : "Razón para devolver"}</label>
                      <textarea id={`reason-${proposal.id}`} value={rationale} maxLength={MAX_RATIONALE_LENGTH} onChange={(event) => { setRationale(event.target.value); setRationaleError(null); }} autoFocus />
                      <div className="form-meta"><span className={rationaleError ? "error" : ""}>{rationaleError ?? "La razón quedará visible y podrá corregirse."}</span><span>{rationale.length}/{MAX_RATIONALE_LENGTH}</span></div>
                      <div className="form-actions"><button className="secondary" type="button" onClick={() => setActiveAction(null)}>Cancelar</button><button className="primary" type="button" onClick={saveReview}>Guardar revisión</button></div>
                    </div>
                  ) : (
                    <div className="decision-row">
                      <p>{review ? "Puedes corregir esta revisión antes de emitir la decisión." : "Requiere criterio institucional y una razón escrita."}</p>
                      <div><button className="secondary" type="button" onClick={() => beginReview(proposal.id, "returned")}>Devolver</button><button className="primary" type="button" onClick={() => beginReview(proposal.id, "confirmed")}>Confirmar</button></div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
          <section className={`calculator ${decisionIssuedAt ? "ready" : "locked"}`} aria-labelledby="calculator-title">
            <div className="section-label">
              <div><p className="eyebrow">Cálculo determinista</p><h3 id="calculator-title">Consecuencias visibles de cada ruta</h3></div>
              <p>{decisionIssuedAt ? `Decisión emitida · ${decisionIssuedAt}` : "Requiere una decisión institucional escrita."}</p>
            </div>
            {!decisionIssuedAt ? (
              <div className="calculator-lock"><span aria-hidden="true">⌁</span><p><strong>Calculadora bloqueada.</strong> Las propuestas de IA nunca entran directamente al cálculo.</p></div>
            ) : (
              <>
                <div className="route-grid compact" aria-label="Dos rutas calculadas con el mismo peso">
                  <RouteCard title="Permanecer" institution={demoCase.currentInstitution} route={currentRoute} tuitionPerSemester={demoCase.assumptions.currentTuitionPerSemester} affordability={demoCase.assumptions.affordabilityPerSemester} note="La brecha económica permanece visible; esta ruta no se descarta." />
                  <RouteCard title="Transferencia" institution={demoCase.destinationInstitution} route={transferRoute} tuitionPerSemester={demoCase.assumptions.transferTuitionPerSemester} affordability={demoCase.assumptions.affordabilityPerSemester} note="Solo usa créditos confirmados; los devueltos cuentan como cero." />
                </div>
                <button className="student-view-button" type="button" onClick={() => setView("student")}>Abrir explicación para Diego <span aria-hidden="true">→</span></button>
              </>
            )}
          </section>
        </section>

        <aside className="gate-panel" aria-labelledby="gate-title">
          <p className="eyebrow">Puerta institucional</p>
          <h2 id="gate-title">{decisionIssuedAt ? "Decisión emitida." : "El cálculo espera."}</h2>
          <p>Solo puede usar créditos que aparezcan en una decisión escrita de la institución.</p>
          <div className={`lock-card ${decisionIssuedAt ? "unlocked" : ""}`}><span aria-hidden="true">{decisionIssuedAt ? "✓" : "⌁"}</span><div><strong>{decisionIssuedAt ? "Puerta institucional abierta" : "Ruta bloqueada"}</strong><small>{decisionIssuedAt ? `Emitida ${decisionIssuedAt}` : blockers.join(" · ") || "Lista para firma institucional."}</small></div></div>
          <ul>
            <li className="complete"><span>✓</span> Fuentes y fechas visibles</li>
            <li className={reviewed === displayProposals.length ? "complete" : ""}><span>{reviewed === displayProposals.length ? "✓" : displayProposals.length - reviewed}</span> Propuestas resueltas</li>
            <li className={decisionIssuedAt ? "complete" : ""}><span>{decisionIssuedAt ? "✓" : "—"}</span> Decisión escrita</li>
          </ul>
          <button className="issue-button" type="button" disabled={!canIssueDecision(displayProposals, reviews) || Boolean(decisionIssuedAt)} onClick={issueDecision}>{decisionIssuedAt ? "Decisión emitida" : "Emitir decisión institucional"}</button>
          <small className="button-help">{blockers.length ? blockers.join(" · ") : decisionIssuedAt ? "Los cambios posteriores volverán a bloquear la ruta." : "La emisión requiere un clic humano explícito."} No se puede omitir la revisión humana.</small>
          <details className="event-log"><summary>Registro de actividad</summary><ol>{events.map((event, index) => <li key={`${event}-${index}`}>{event}</li>)}</ol></details>
        </aside>
      </div>

      <footer><span>Trayectoria · prototipo de verificación</span><span>Sin ranking · sin destino predicho · con evidencia corregible</span></footer>
    </main>
  );
}
