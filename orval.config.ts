import { config as loadEnv } from "dotenv";
import { defineConfig } from "orval";

loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

const backendUrlRaw = process.env.ORVAL_BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL;
if (!backendUrlRaw) {
  throw new Error("Missing ORVAL_BACKEND_URL or NEXT_PUBLIC_BACKEND_URL for Orval generation.");
}

const backendUrl = backendUrlRaw.replace(/\/$/, "");
// Admin codegen should target the admin-only OpenAPI surface by default.
const openApiPathRaw = process.env.NEXT_PUBLIC_OPENAPI_PATH ?? "/swagger-yaml-admin";
const openApiPath = openApiPathRaw.startsWith("/") ? openApiPathRaw : `/${openApiPathRaw}`;
if (!openApiPath.toLowerCase().includes("admin")) {
  throw new Error(
    `Admin codegen must target an admin-only OpenAPI path. Got "${openApiPath}". ` +
      `Use "/swagger-yaml-admin" (or another admin-only path).`,
  );
}

export default defineConfig({
  textbookedAdmin: {
    input: {
      target: `${backendUrl}${openApiPath}`,
    },
    output: {
      target: "./lib/api/generated/admin-client.ts",
      schemas: "./lib/api/generated/schemas",
      client: "react-query",
      mode: "split",
      prettier: false,
      override: {
        mutator: {
          path: "./lib/api/axios.ts",
        },
      },
    },
  },
  textbookedAdminAxios: {
    input: {
      target: `${backendUrl}${openApiPath}`,
    },
    output: {
      target: "./lib/api/generated/admin-client-axios.ts",
      schemas: "./lib/api/generated/schemas",
      client: "axios",
      mode: "split",
      prettier: false,
      override: {
        mutator: {
          path: "./lib/api/axios.ts",
        },
      },
    },
  },
});
