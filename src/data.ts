export type ProposalStatus = "pending" | "confirmed" | "returned";

export type CourseProposal = {
  id: string;
  sourceCourse: { code: string; name: string; credits: number };
  targetCourse: { code: string; name: string; credits: number };
  sourceDocument: string;
  evidenceDate: string;
  contentEvidence: readonly string[];
  missingEvidence: readonly string[];
  aiExplanation: string;
  status: ProposalStatus;
};

export type ProposalReview = {
  status: Exclude<ProposalStatus, "pending">;
  rationale: string;
  evaluatorName: string;
  decidedAt: string;
};

export const demoCase = {
  id: "T-014",
  student: "Diego N.",
  age: 20,
  currentInstitution: "Instituto Metropolitano",
  destinationInstitution: "Universidad Horizonte",
  program: "Ingeniería Industrial",
  currentCredits: 96,
  previouslyConfirmedTransferCredits: 78,
  destinationCredits: 240,
  paymentDeadline: "18 sep 2026",
  assumptions: {
    creditsPerSemester: 30,
    currentTuitionPerSemester: 48000,
    transferTuitionPerSemester: 38500,
    affordabilityPerSemester: 42000,
    evidenceDate: "02 sep 2026",
  },
  priority: "Continuar hacia un título reconocido sin comprometer la estabilidad familiar.",
  label: "Datos totalmente inventados para demostración",
} as const;

export const proposals: readonly CourseProposal[] = [
  {
    id: "EQ-101",
    sourceCourse: { code: "IM-IO-101", name: "Investigación de operaciones I", credits: 6 },
    targetCourse: { code: "UH-IO-110", name: "Optimización de sistemas", credits: 6 },
    sourceDocument: "Temario institucional 2026 · versión 2",
    evidenceDate: "10 abr 2026",
    contentEvidence: ["Programación lineal", "Método simplex", "Modelos de transporte"],
    missingEvidence: [],
    aiExplanation: "Los objetivos y cinco unidades temáticas parecen comparables; la institución debe confirmar alcance y secuencia.",
    status: "pending",
  },
  {
    id: "EQ-204",
    sourceCourse: { code: "IM-ES-204", name: "Estadística aplicada", credits: 6 },
    targetCourse: { code: "UH-ES-210", name: "Estadística para ingeniería", credits: 6 },
    sourceDocument: "Programa analítico 2026 · firmado",
    evidenceDate: "08 abr 2026",
    contentEvidence: ["Inferencia estadística", "Regresión", "Diseño de experimentos"],
    missingEvidence: [],
    aiExplanation: "La evidencia muestra cobertura similar, pero la propuesta no constituye una resolución de equivalencia.",
    status: "pending",
  },
  {
    id: "EQ-301",
    sourceCourse: { code: "IM-PM-301", name: "Procesos de manufactura", credits: 6 },
    targetCourse: { code: "UH-SM-320", name: "Sistemas de manufactura", credits: 8 },
    sourceDocument: "Descripción de curso 2026 · sin anexos",
    evidenceDate: "05 abr 2026",
    contentEvidence: ["Procesos de transformación", "Control básico de calidad"],
    missingEvidence: ["Horas de laboratorio", "Unidad de automatización"],
    aiExplanation: "Existe afinidad parcial, pero faltan horas de laboratorio y contenido de automatización para sostener la equivalencia.",
    status: "pending",
  },
];
