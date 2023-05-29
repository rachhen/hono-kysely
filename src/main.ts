import { serve } from "@hono/node-server";
import app from "./app";

serve(app);
console.log("Server running on http://localhost:3000");
