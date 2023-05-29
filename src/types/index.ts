import { User } from "kysely-codegen";

type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET_KET: string;
};

type Variables = {
  user: User;
};

export type Env = { Bindings: Bindings; Variables: Variables };
