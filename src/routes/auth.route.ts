import createError from "http-errors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Hono } from "hono";
import { User } from "kysely-codegen";
import { zValidator } from "@hono/zod-validator";

import { Env } from "../types";
import { db } from "../database";
import * as authSchema from "../schemas/auth.schema";
import { requiredAuth } from "../middleware/auth.middleware";

const auth = new Hono<Env>();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY!;

auth.post(
  "/register",
  zValidator("json", authSchema.registerSchema),
  async (c) => {
    const input = c.req.valid("json");
    const salt = await bcrypt.genSalt();
    const password = await bcrypt.hash(input.password, salt);

    try {
      const newUser = await db
        .insertInto("user")
        .values({ ...input, password })
        .returningAll()
        .executeTakeFirst();

      const cleanUser = Object.assign(newUser!, {
        password: undefined,
      }) as User;
      const accessToken = jwt.sign({ id: cleanUser.id }, JWT_SECRET_KEY);

      return c.json({ user: cleanUser, accessToken });
    } catch (error: any) {
      if (error.code === "23505") {
        throw new createError.Conflict("Email already taken");
      }
    }
  }
);

auth.post("/login", zValidator("json", authSchema.loginSchema), async (c) => {
  const input = c.req.valid("json");
  const user = await db
    .selectFrom("user")
    .selectAll()
    .where("email", "=", input.email)
    .executeTakeFirst();

  if (!user) {
    throw new createError.BadRequest("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(input.password, user.password);
  if (!isMatch) {
    throw new createError.BadRequest("Invalid credentials");
  }

  const cleanUser = Object.assign(user, {
    password: undefined,
  }) as User;

  const accessToken = jwt.sign({ id: cleanUser.id }, JWT_SECRET_KEY);

  return c.json({ user: cleanUser, accessToken });
});

auth.get("/me", requiredAuth(), async (c) => {
  return c.json(c.get("user"));
});

export default auth;
