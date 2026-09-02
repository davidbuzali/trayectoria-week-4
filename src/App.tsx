import { useState } from "react";
import { demoCase, proposals, type ProposalStatus } from "./data";

const statusText: Record<ProposalStatus, string> = {
  pending: "Pendiente de revisión",
  confirmed: "Confirmada por evaluadora",
  returned: "Devuelta por evidencia",
};

export default function App() {
  const [statuses, setStatuses] = useState<Record<string, ProposalStatus>>({});
  const reviewed = Object.values(statuses).filter((status) => status !== "pending").length;

  function setStatus(id: string, status: ProposalStatus) {
    setStatuses((current) => ({ ...current, [id]: status }));
  }

  return (
    <main>
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
        <button type="button">Vista de Diego <span aria-hidden="true">↗</span></button>
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
        </aside>

        <section className="workspace" aria-labelledby="workspace-title">
          <div className="workspace-heading">
            <div>
              <p className="eyebrow">Revisión activa · {reviewed} de {proposals.length} resueltas</p>
              <h2 id="workspace-title">Confirma la evidencia, no la predicción</h2>
              <p>La IA propuso coincidencias entre cursos. Una persona autorizada debe aceptar o devolver cada una antes de emitir una decisión institucional.</p>
            </div>
            <span className="status-pill"><i /> Revisión humana pendiente</span>
          </div>

          <ol className="process" aria-label="Flujo de verificación">
            <li className="done"><span>1</span><div><strong>Propuesta de IA</strong><small>Completada · no vinculante</small></div></li>
            <li className="active"><span>2</span><div><strong>Revisión humana</strong><small>En curso</small></div></li>
            <li><span>3</span><div><strong>Decisión escrita</strong><small>Aún no emitida</small></div></li>
            <li><span>4</span><div><strong>Cálculo de ruta</strong><small>Bloqueado</small></div></li>
          </ol>

          <div className="section-label">
            <div><p className="eyebrow">Coincidencias propuestas</p><h3>Curso por curso</h3></div>
            <p><span>✦</span> La similitud organiza la revisión; no demuestra equivalencia.</p>
          </div>

          <div className="match-list">
            {proposals.slice(0, 2).map((proposal) => {
              const status = statuses[proposal.id] ?? proposal.status;
              return (
                <article className={`match-card ${status}`} key={proposal.id}>
                  <div className="match-topline"><span>{proposal.id}</span><span className="ai-chip">✦ PROPUESTA DE IA SIMULADA</span><span className={`review-chip ${status}`}>{statusText[status]}</span></div>
                  <div className="course-pair">
                    <div><small>Curso de origen</small><strong>{proposal.sourceCourse.name}</strong><span>{proposal.sourceCourse.code} · {proposal.sourceCourse.credits} créditos</span></div>
                    <b aria-hidden="true">→</b>
                    <div><small>Curso candidato</small><strong>{proposal.targetCourse.name}</strong><span>{proposal.targetCourse.code} · {proposal.targetCourse.credits} créditos</span></div>
                  </div>
                  <div className="evidence-line"><span>Fuente verificable</span><strong>{proposal.sourceDocument}</strong><small>{proposal.evidenceDate}</small><button type="button">Ver evidencia</button></div>
                  <div className="decision-row">
                    <p>{status === "pending" ? "Requiere criterio institucional." : statusText[status]}</p>
                    <div><button className="secondary" type="button" onClick={() => setStatus(proposal.id, "returned")}>Devolver</button><button className="primary" type="button" onClick={() => setStatus(proposal.id, "confirmed")}>Confirmar</button></div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="gate-panel" aria-labelledby="gate-title">
          <p className="eyebrow">Puerta institucional</p>
          <h2 id="gate-title">El cálculo espera.</h2>
          <p>Solo puede usar créditos que aparezcan en una decisión escrita de la institución.</p>
          <div className="lock-card"><span aria-hidden="true">⌁</span><div><strong>Ruta bloqueada</strong><small>Faltan decisiones y la firma institucional.</small></div></div>
          <ul>
            <li className="complete"><span>✓</span> Fuentes y fechas visibles</li>
            <li><span>{proposals.length - reviewed}</span> Propuestas por resolver</li>
            <li><span>—</span> Decisión escrita pendiente</li>
          </ul>
          <button className="issue-button" type="button" disabled>Emitir decisión institucional</button>
          <small className="button-help">No se puede omitir la revisión humana.</small>
        </aside>
      </div>

      <footer><span>Trayectoria · prototipo de verificación</span><span>Sin ranking · sin destino predicho · con evidencia corregible</span></footer>
    </main>
  );
}
