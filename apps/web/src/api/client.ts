import { treaty } from "@elysiajs/eden";
// Importing type only to avoid runtime dependency on backend files in frontend build if not handled correctly by bundler.
// Ideally, we should export the type from the backend to a shared package or use a relative import that Vite can handle.
// Since it's a monorepo, we can import the type directly if valid.
import type { App } from "../../../api/src/index";

export const api = treaty<App>("http://localhost:3000", {
    fetch: {
        credentials: "include"
    }
});
