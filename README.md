# 🌌 Astromatic: Content Engine

An automated video generation and distribution platform for **Astrología Familiar**. This system programmatically renders personalized astrological content using **Remotion** and publishes it directly to social media via the **Instagram Graph API**.

## 🚀 Key Features

* **Cloud-Native Storage:** Fully integrated with **Cloudflare R2** for asset sourcing and distribution.
* **Multi-Template Architecture:** Support for multiple video templates (ASFA-T1, ASFA-T2) with template-specific Airtable tables.
* **Smart Video Looping:** Uses FFprobe to fetch video metadata for intelligent background looping.
* **Dynamic Duration Calculation:** Automatically calculates video duration based on text content length.
* **Automated Pipeline:** Full "Fetch-to-Post" workflow including storage in R2 and publishing to Instagram.
* **Dual Daily Scheduling:** GitHub Actions runs twice daily (11:00 AM and 6:00 PM CET) with zero manual intervention.
* **Smart Notifications:** Real-time monitoring via Telegram bot for pipeline status and error logging.

---

## 🛠 Tech Stack

* **Core:** [Node.js](https://nodejs.org/) (ES Modules)
* **Video Engine:** [Remotion](https://www.remotion.dev/) (React-based video)
* **Storage:** [Cloudflare R2](https://www.cloudflare.com/products/r2/) (S3-compatible)
* **Social Integration:** Instagram Graph API
* **Metadata Extraction:** FFprobe for video duration analysis
* **Alerting:** Telegram Bot API for real-time status updates

---

## 📂 Project Structure

```text
.
├── .github/workflows/      # GitHub Actions automation pipeline (dual scheduling)
├── src/
│   ├── templates/          # Remotion video templates (ASFA-T1.jsx, ASFA-T2.jsx)
│   ├── core/               # Core modules (S3/R2, Airtable, Instagram, Timing, Metadata)
│   ├── main.js             # Production entry point for full automation cycle
│   └── dev.js              # Local development and testing script
├── public/                 # Static fallback assets (Fonts, fallback media)
├── out/                    # Local directory for temporary render artifacts
├── .env                    # Private credentials (ignored by git)
└── package.json            # Current version: 2.2.1
```

---

## ⚙️ Setup & Installation

### 1. Prerequisites

Ensure you have **Node.js 20+** installed. FFmpeg and Chromium are handled automatically by Remotion and the GHA workflow.

### 2. Environment Configuration

Clone the `.env.example` to `.env` and provide the following:

* **Airtable:** `AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID`, `AIRTABLE_ASFA_T1_TABLE_ID`, `AIRTABLE_ASFA_T2_TABLE_ID`.
* **Cloudflare R2:** `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`, `R2_BUCKET_NAME`, and `R2_PUBLIC_URL`.
* **Instagram:** `IG_TOKEN` and `IG_USER_ID`.
* **Alerting:** `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.

### 3. Install Dependencies

```bash
npm install
```

---

## 🎮 Workflow Commands

| Command | Action |
| --- | --- |
| `npm start` | Run the full automation cycle for default template (ASFA-T1) |
| `npm start asfa-t2` | Run the full automation cycle for ASFA-T2 template |
| `npm run dev` | Test the pipeline locally (Airtable → Render → out/test-video.mp4) |
| `npm run dev asfa-t2` | Test ASFA-T2 template locally |
| `npm run remotion` | Open Remotion Studio for visual template preview |

---

## 📝 Automation (GitHub Actions)

The pipeline is configured to run automatically **twice daily** via GitHub Actions:
- **11:00 AM CET** (10:00 UTC) - Runs ASFA-T1 template
- **6:00 PM CET** (17:00 UTC) - Runs ASFA-T2 template

Manual workflow dispatch is also available with template selection (all, asfa-t1, or asfa-t2).

To set up:
1. Fork/Clone the repository.
2. Add all `.env` variables as **Repository Secrets** in GitHub.
3. Enable the workflow in the **Actions** tab.

---

## ⚖️ License

Proprietary.