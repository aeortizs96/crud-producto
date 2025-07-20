import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const productoSchema = z.object({
  nombre: z.string().min(1),
  descripcion: z.string().min(1),
  cantidad: z.number().min(0),
  precio: z.number().min(0),
});

export const productoRouter = createTRPCRouter({
  listar: publicProcedure.query(({ ctx }) => {
    return ctx.db.producto.findMany();
  }),

  crear: publicProcedure.input(productoSchema).mutation(({ ctx, input }) => {
    return ctx.db.producto.create({ data: input });
  }),

  actualizar: publicProcedure
    .input(productoSchema.extend({ id: z.number() }))
    .mutation(({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.producto.update({ where: { id }, data });
    }),

  eliminar: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.producto.delete({ where: { id: input.id } });
    }),
});
