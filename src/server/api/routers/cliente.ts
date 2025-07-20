import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const clienteSchema = z.object({
  nombre: z.string().min(1),
  apellidoP: z.string().min(1),
  apellidoM: z.string().min(1),
  ci: z.string().min(1),
  correo: z.string().email(),
  numero: z.string().min(1),
  nit: z.string().min(1),
  nacimiento: z.date(),
  pais: z.string().min(1),
});

export const clienteRouter = createTRPCRouter({
  // 🔍 Obtener todos los clientes
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.cliente.findMany();
  }),

  // 🆕 Crear cliente nuevo
  create: publicProcedure
    .input(clienteSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.cliente.create({
        data: input,
      });
    }),

  // 🗑 Eliminar cliente por ID
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.cliente.delete({ where: { id: input.id } });
    }),

  // 🖊 Editar cliente existente
  update: publicProcedure
    .input(
      clienteSchema.extend({
        id: z.number(),
        nacimiento: z.coerce.date(), // Convertimos string a Date
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.cliente.update({
        where: { id },
        data,
      });
    }),

  // 🧾 Alias para getAll si lo estás usando en otro componente
  listar: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.cliente.findMany();
  }),
});
