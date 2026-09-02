# Trayectoria · Week 4

Trayectoria is a bounded academic prototype for institutional course-equivalency verification. AI may organize a provisional proposal; an authorized human must confirm or return every record with a written rationale; a separate written decision must then be issued before deterministic route calculations become available.

All people, institutions, records, costs, and dates shown in the product are fictional demonstration data.

## Links

- Production prototype: <https://week-4-trajectory-verification.vercel.app>
- Source repository: <https://github.com/davidbuzali/trayectoria-week-4>
- Planning packet: [`docs/PACKET.md`](docs/PACKET.md)
- Packet PDF: [`output/pdf/PACKET_davidbuzali.pdf`](output/pdf/PACKET_davidbuzali.pdf)
- Implementation prompt: [`docs/IMPLEMENTATION_PROMPT.md`](docs/IMPLEMENTATION_PROMPT.md)
- Mechanical test record: [`docs/TESTING.md`](docs/TESTING.md)
- Diego persona record: [`docs/PERSONA.md`](docs/PERSONA.md)
- Persona PDF: [`output/pdf/PERSONA_davidbuzali.pdf`](output/pdf/PERSONA_davidbuzali.pdf)
- Full visible build-chat PDF: [`output/pdf/BUILDCHAT_davidbuzali.pdf`](output/pdf/BUILDCHAT_davidbuzali.pdf)
- Decision log: [`DECISIONS.md`](DECISIONS.md)

## Run locally

Requirements: Node.js 22.13 or newer and pnpm.

```bash
pnpm install
pnpm dev
```

Open the local URL printed by Vite.

## Verify

```bash
pnpm run check
```

The check runs TypeScript validation, the production build, deterministic logic tests, the proposal endpoint contract test, and source-level safety-boundary checks.

## Optional live proposal mode

The default is a deterministic simulation. To use the server-side model boundary, copy `.env.example` to `.env.local` and configure `LLM_MODE=live`, `OPENAI_API_KEY`, and `OPENAI_MODEL`. Keys must never be exposed to the client or committed.

Model output remains provisional and cannot modify institutional review state, issue a decision, or perform route arithmetic.
