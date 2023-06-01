import { serve } from "@hono/node-server";
import app from "./app";

const PORT = process.env.PORT || 3000;

serve({ fetch: app.fetch, port: +PORT });
console.log("Server running on http://localhost:3000");
