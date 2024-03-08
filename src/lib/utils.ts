import { currentUser } from "@clerk/nextjs";
import { inferAsyncReturnType } from "@trpc/server";

export async function createContext(request: Request) {
  const user = await currentUser();
  return {
    user,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
