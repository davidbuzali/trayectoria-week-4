type ApiRequest = {
  method?: string;
  body?: unknown;
};

type ApiResponse = {
  status(code: number): ApiResponse;
  json(payload: unknown): void;
};

const records = {
  "EQ-101": {
    proposalId: "EQ-101",
    source: "Investigación de operaciones I: programación lineal, simplex y transporte; 6 créditos.",
    target: "Optimización de sistemas: modelado, simplex, transporte y redes; 6 créditos.",
    simulatedExplanation: "Los objetivos y cinco unidades parecen comparables; la institución debe confirmar alcance y secuencia.",
    simulatedMissingEvidence: [],
  },
  "EQ-204": {
    proposalId: "EQ-204",
    source: "Estadística aplicada: inferencia, regresión y diseño de experimentos; 6 créditos.",
    target: "Estadística para ingeniería: inferencia, regresión y experimentación; 6 créditos.",
    simulatedExplanation: "La evidencia muestra cobertura similar, pero la propuesta no constituye una resolución de equivalencia.",
    simulatedMissingEvidence: [],
  },
  "EQ-301": {
    proposalId: "EQ-301",
    source: "Procesos de manufactura: transformación y control básico de calidad; 6 créditos.",
    target: "Sistemas de manufactura: procesos, automatización, laboratorio y calidad; 8 créditos.",
    simulatedExplanation: "Existe afinidad parcial, pero faltan pruebas de laboratorio y automatización.",
    simulatedMissingEvidence: ["Horas de laboratorio", "Unidad de automatización"],
  },
} as const;

type RecordId = keyof typeof records;

function parseIds(body: unknown): RecordId[] | null {
  if (!body || typeof body !== "object" || !("proposalIds" in body)) return null;
  const ids = (body as { proposalIds?: unknown }).proposalIds;
  if (!Array.isArray(ids) || ids.length < 1 || ids.length > 3) return null;
  if (!ids.every((id): id is RecordId => typeof id === "string" && id in records)) return null;
  return [...new Set(ids)];
}

function simulated(ids: RecordId[]) {
  return ids.map((id) => ({
    proposalId: id,
    explanation: records[id].simulatedExplanation,
    missingEvidence: [...records[id].simulatedMissingEvidence],
  }));
}

function validateModelOutput(value: unknown, ids: RecordId[]) {
  if (!value || typeof value !== "object" || !("proposals" in value)) return null;
  const candidates = (value as { proposals?: unknown }).proposals;
  if (!Array.isArray(candidates) || candidates.length !== ids.length) return null;
  const allowed = new Set(ids);
  const valid = candidates.every((candidate) => {
    if (!candidate || typeof candidate !== "object") return false;
    const item = candidate as Record<string, unknown>;
    return typeof item.proposalId === "string"
      && allowed.has(item.proposalId as RecordId)
      && typeof item.explanation === "string"
      && item.explanation.length >= 1
      && item.explanation.length <= 420
      && Array.isArray(item.missingEvidence)
      && item.missingEvidence.length <= 4
      && item.missingEvidence.every((entry) => typeof entry === "string" && entry.length <= 100);
  });
  return valid ? candidates : null;
}

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Método no permitido" });
  }

  const ids = parseIds(request.body);
  if (!ids) return response.status(400).json({ error: "Identificadores fuera del conjunto permitido" });

  const mode = process.env.LLM_MODE ?? "simulated";
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL;

  if (mode !== "live" || !apiKey || !model) {
    return response.status(200).json({ mode: "simulated", proposals: simulated(ids) });
  }

  try {
    const selected = ids.map((id) => records[id]);
    const modelResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        store: false,
        instructions: "Actúa como asistente de pre-revisión. Compara solo la evidencia proporcionada. No apruebes equivalencias, no asignes puntajes, no ordenes rutas y no inventes información. Devuelve español conciso.",
        input: JSON.stringify(selected),
        max_output_tokens: 700,
        text: {
          format: {
            type: "json_schema",
            name: "course_equivalency_proposals",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                proposals: {
                  type: "array",
                  minItems: ids.length,
                  maxItems: ids.length,
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      proposalId: { type: "string", enum: ids },
                      explanation: { type: "string", maxLength: 420 },
                      missingEvidence: { type: "array", maxItems: 4, items: { type: "string", maxLength: 100 } },
                    },
                    required: ["proposalId", "explanation", "missingEvidence"],
                  },
                },
              },
              required: ["proposals"],
            },
          },
        },
      }),
    });

    if (!modelResponse.ok) throw new Error(`Model request failed: ${modelResponse.status}`);
    const payload = await modelResponse.json() as { output_text?: unknown };
    if (typeof payload.output_text !== "string") throw new Error("Missing structured output");
    const proposals = validateModelOutput(JSON.parse(payload.output_text), ids);
    if (!proposals) throw new Error("Invalid structured output");
    return response.status(200).json({ mode: "live", proposals });
  } catch {
    return response.status(200).json({ mode: "simulated", fallbackReason: "live_model_unavailable", proposals: simulated(ids) });
  }
}
