import "dotenv/config";
import { Hono } from "hono";
import { HttpError } from "http-errors";

import auth from "./routes/auth.route";

const app = new Hono().basePath("/api/v1");

app.get("/", (c) => c.text("Hello World"));
app.route("/auth", auth);
app.onError(async (err, c) => {
  if (err instanceof HttpError) {
    c.status(err.status);
  } else {
    c.status(500);
  }

  return c.json({
    success: false,
    error: {
      message: err.message,
      name: err.name,
    },
  });
});

export default app;
