import {
  FetchCreateContextFnOptions,
  fetchRequestHandler,
} from "@trpc/server/adapters/fetch";
import { appRouter } from "../trpc-router";
import { Context, createContext } from "@/lib/utils";

const handler = async (request: Request) => {
  const ctx = await createContext(request);
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: function (opts: FetchCreateContextFnOptions): Context {
      return ctx;
    },
  });
};

export { handler as GET, handler as POST };
