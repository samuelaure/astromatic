# ⚠️ Project Deprecation Notice

**Project:** Astromatic (Content Engine)  
**Status:** Deprecated (Maintenance Mode)  
**Last "Gold" Version:** 2.2.2

## Reason for Deprecation
This project has served its purpose as a data-driven video automation engine. Future development will transition to a new architecture or platform. 

## Final State Quality
Before deprecation, this project was upgraded to meet the **Global Engineering Protocols**. It serves as a reference implementation for:
*   **Modular Monolith Architecture** with domain-based organization.
*   **Strict TypeScript** migration with robust type safety.
*   **Resilient API Integrations** using exponential backoff retry logic.
*   **Zod-powered configuration** for environment safety.
*   **Professional Tooling** (Vitest, tsx, ESLint, Prettier).

## Maintenance Instructions
If critical bugs arise, they should be fixed following the established domain modules in `src/modules/`. 

To run a test cycle locally:
```bash
npm run dev
```

To run the full production cycle:
```bash
npm start
```

## Acknowledgements
Thank you to everyone who contributed to the success of this engine.
