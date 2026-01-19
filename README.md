# 🌌 Astromatic: Content Engine

An automated video generation and distribution platform for **Astrología Familiar**. This system programmatically renders personalized astrological content using **Remotion** and publishes it directly to social media via the **Instagram Graph API**.

## 🚀 Key Features

* **Cloud-Native Storage:** Fully integrated with **Cloudflare R2** for asset sourcing and distribution, replacing legacy FTP.
* **Multi-Template Architecture:** Support for high-quality video templates (ReelV1).
* **Automated Pipeline:** Full "Fetch-to-Post" workflow including storage in R2 and publishing to Instagram.
* **GitHub Actions Integration:** Scheduled daily runs with zero manual intervention required.
* **Smart Notifications:** Real-time monitoring via Telegram bot for pipeline status and error logging.

---

## 🛠 Tech Stack

* **Core:** [Node.js](https://nodejs.org/) (ES Modules)
* **Video Engine:** [Remotion](https://www.remotion.dev/) (React-based video)
* **Storage:** [Cloudflare R2](https://www.cloudflare.com/products/r2/) (S3-compatible)
* **Social Integration:** Instagram Graph API
* **Alerting:** Telegram Bot API for real-time status updates

---

## 📂 Project Structure

```text
.
├── .github/workflows/      # GitHub Actions automation pipeline
├── src/
│   ├── templates/          # Remotion video templates (ReelV1.jsx)
│   ├── core/               # S3/R2 client, Airtable logic, Timing
│   ├── main.js             # Entry point for the full automation cycle
│   └── dev.js              # Local development and testing script
├── public/                 # Static fallback assets (Fonts, fallback media)
├── out/                    # Local directory for temporary render artifacts
├── .env                    # Private credentials (ignored by git)
└── package.json            # Version 2.0.0+ (R2 Migration)
```

---

## ⚙️ Setup & Installation

### 1. Prerequisites

Ensure you have **Node.js 20+** installed. FFmpeg and Chromium are handled automatically by Remotion and the GHA workflow.

### 2. Environment Configuration

Clone the `.env.example` to `.env` and provide the following:

* **Airtable:** `AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID`, `AIRTABLE_TABLE_ID`.
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
| `npm start` | Run the full automation cycle (Airtable → Render → R2 → Instagram) |
| `npm run dev` | Test the pipeline locally (Airtable → Render → out/test-video.mp4) |
| `npm run remotion` | Open Remotion Studio for visual template preview |

---

## 📝 Automation (GitHub Actions)

The pipeline is configured to run automatically at **11:00 AM CET** via GitHub Actions.

To set up:
1. Fork/Clone the repository.
2. Add all `.env` variables as **Repository Secrets** in GitHub.
3. Enable the workflow in the **Actions** tab.