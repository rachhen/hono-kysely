import jwt from "jsonwebtoken";
import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { User } from "kysely-codegen";

import { Env } from "../types";
import { db } from "../database";

export const requiredAuth = () => async (c: Context<Env>, next: Next) => {
  const credentials = c.req.headers.get("Authorization");
  let token: string;
  if (credentials) {
    const parts = credentials.split(/\s+/);
    if (parts.length !== 2) {
      const res = new Response("Unauthorized", {
        status: 401,
        headers: {
          "WWW-Authenticate": `Bearer realm="${c.req.url}",error="invalid_request",error_description="invalid credentials structure"`,
        },
      });
      throw new HTTPException(401, { res });
    } else {
      token = parts[1];
    }

    if (!token) {
      const res = new Response("Unauthorized", {
        status: 401,
        headers: {
          "WWW-Authenticate": `Bearer realm="${c.req.url}",error="invalid_request",error_description="no authorization included in request"`,
        },
      });
      throw new HTTPException(401, { res });
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET_KEY!) as {
        id: number;
        iat: number;
      };

      const user = await db
        .selectFrom("user")
        .selectAll()
        .where("id", "=", payload.id)
        .executeTakeFirst();

      if (!user) {
        const res = new Response("Unauthorized", {
          status: 401,
          headers: {
            "WWW-Authenticate": `Bearer realm="${c.req.url}",error="invalid_token",error_description="token verification failure"`,
          },
        });
        throw new HTTPException(401, { res });
      }

      const newUser = Object.assign(user, { password: undefined }) as User;

      c.set("user", newUser);
    } catch (error) {
      const res = new Response("Unauthorized", {
        status: 401,
        statusText: `${error}`,
        headers: {
          "WWW-Authenticate": `Bearer realm="${c.req.url}",error="invalid_token",error_description="token verification failure"`,
        },
      });
      throw new HTTPException(401, { res });
    }
  }

  await next();
};
