import { clienteRouter } from "./routers/cliente";
import { productoRouter } from "./routers/producto";
import { ventaRouter } from "./routers/venta";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({
  cliente: clienteRouter,
  producto: productoRouter,
  venta: ventaRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
