# 🌌 Astromatic: Content Engine

An automated video generation and distribution platform for **Astrología Familiar**. This system programmatically renders personalized astrological content using **Remotion** and publishes it directly to social media via the **Instagram Graph API**.

## 🚀 Key Features

* **Multi-Template Architecture:** Support for various video templates.
* **Programmatic Rendering:** Dynamic video generation.
* **Automated Pipeline:** Full "Render-to-Publish" workflow including FTP asset hosting.
* **Smart Notifications:** Real-time monitoring via Telegram bot for pipeline status and error logging.
* **Ready for Scale:** Designed to run unattended via scheduled cron jobs.

---
## 🛠 Tech Stack

* **Core:** [Node.js](https://nodejs.org/) (ES Modules)
* **Video Engine:** [Remotion](https://www.remotion.dev/) (React-based video) 
* **Social Integration:** Instagram Graph API 
* **Infrastructure:** FTP for static asset delivery & Telegram Bot API for alerting 

---
## 📂 Project Structure

```text
.
├── src/
│   ├── templates/          # Directory for various videos templates
│   ├── core/               # Shared logic (API clients, formatting)
│   ├── publish-ig.js       # Instagram Graph API logic 
│   └── telegram.js         # Notification service
├── public/                 # Brand assets (Fonts, Logos, Audio) 
├── out/                    # Final rendered MP4/PNG artifacts 
├── .env                    # Private credentials (ignored by git)
└── package.json            # Dependencies and automation scripts 

```

---

## ⚙️ Setup & Installation

### 1. Prerequisites

Ensure you have **Node.js 18+** and **FFmpeg** installed on your system.

### 2. Environment Configuration

Clone the `.env.example` to `.env` and provide the following:

* **Instagram:** `IG_TOKEN` and `IG_USER_ID`.
* **Hosting:** FTP credentials for temporary video storage (required for IG publishing).
* **Alerting:** `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`.

### 3. Install Dependencies

```bash
npm install

```

---

## 🎮 Workflow Commands

| Command | Action |
| --- | --- |
| `npm run start` | Open Remotion Studio to preview templates |
| `npm run render` | Generate video and cover frame for a specific template |
| `npm run publish` | Upload assets to FTP and publish to Instagram |
| `npm run daily` | Execute the full pipeline (Notify → Render → Publish) |
---

## 📝 Automation (Cron)

To run the pipeline automatically every morning (e.g., 8:00 AM), add this to your crontab:

```bash
0 8 * * * cd /path/to/astrologia-familiar && npm run daily >> logs/cron.log 2>&1

```