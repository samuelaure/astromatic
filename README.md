# 🌌 Astromatic: Content Engine (Deprecated)

[![Status](https://img.shields.io/badge/status-deprecated-red)]()
[![Type](https://img.shields.io/badge/architecture-modular_monolith-blue)]()
[![Stack](https://img.shields.io/badge/stack-TS%20|%20Node%20|%20Remotion-green)]()

An automated video generation and distribution platform for **Astrología Familiar**. This system renders personalized astrological content using **Remotion** and publishes it to social media via the **Instagram Graph API**.

> [!CAUTION]
> This project is now in **Maintenance Mode**. For final documentation on state and rationale, see [DEPRECATION.md](./DEPRECATION.md).

---

## 🚀 Key Features

*   **Modular Monolith:** Domain-driven organization (`content`, `storage`, `rendering`, `distribution`).
*   **Strict Type Safety:** Fully migrated to TypeScript with 0 compiler errors.
*   **Resilient Pipeline:** Exponential backoff retry logic for all external API integrations.
*   **Cloud-Native Storage:** Integration with **Cloudflare R2** for asset sourcing.
*   **Smart Video Engine:** Dynamic duration calculation and intelligent background looping using FFprobe.
*   **Automated Workflow:** GitHub Actions powered "Fetch-to-Post" recurring cycle.

---

## 🛠 Tech Stack

*   **Language:** TypeScript (NodeNext / ESM)
*   **Video Engine:** [Remotion](https://www.remotion.dev/) (React-based video)
*   **Validation:** [Zod](https://zod.dev/) for environment and data integrity.
*   **Storage:** Cloudflare R2 (S3-compatible)
*   **Alerting:** Telegram Bot API for real-time status reporting.
*   **Logging:** Pino (with pino-pretty for development).

---

## 📂 Project Structure

```text
.
├── src/
│   ├── modules/            # Domain-based modules
│   │   ├── content/        # Airtable sourcing logic
│   │   ├── storage/        # Cloudflare R2 integration
│   │   ├── distribution/   # Instagram publishing
│   │   ├── rendering/      # Remotion orchestrator & metadata extraction
│   │   ├── automation/     # Pipeline services (Core logic)
│   │   ├── shared/         # Config, constants, errors, logger
│   ├── templates/          # Remotion video templates (TSX)
│   ├── index.ts            # Remotion entry point
│   ├── main.ts             # Production entry point
│   └── dev.ts              # Local development entry point
├── public/                 # Static fallback assets
├── Dockerfile              # Container definition
└── package.json            # Version 2.2.2 (Gold Standard)
```

---

## 🎮 Workflow Commands

| Command | Action |
| --- | --- |
| `npm start` | Run the full production automation cycle |
| `npm run dev` | Test the pipeline locally (Dry run - Render only) |
| `npm run type-check` | Run TypeScript validation |
| `npm run lint` | Run ESLint check |
| `npm run format` | Format codebase with Prettier |
| `npm run remotion` | Open Remotion Studio for template preview |

---

## ⚖️ License

Proprietary. © 2026 Samuel Aure.