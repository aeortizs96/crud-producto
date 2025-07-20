import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const ventaRouter = createTRPCRouter({
  listar: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.venta.findMany({
      include: {
        cliente: true,
        productos: {
          include: {
            producto: true,
          },
        },
      },
    });
  }),

  buscarPorCliente: publicProcedure
    .input(z.object({ clienteId: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.venta.findMany({
        where: { clienteId: input.clienteId },
        include: {
          productos: {
            include: {
              producto: true,
            },
          },
        },
      });
    }),

  buscarPorProducto: publicProcedure
    .input(z.object({ productoId: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.venta.findMany({
        where: {
          productos: {
            some: { productoId: input.productoId },
          },
        },
        include: {
          cliente: true,
          productos: {
            include: {
              producto: true,
            },
          },
        },
      });
    }),

  crear: publicProcedure
    .input(
      z.object({
        clienteId: z.number().min(1, "Selecciona un cliente"),
        productos: z
          .array(
            z.object({
              productoId: z.number().min(1, "Selecciona un producto"),
              cantidad: z.number().min(1, "La cantidad debe ser al menos 1"),
            })
          )
          .min(1, "Agrega al menos un producto"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = ctx.db;

      const productosDB = await db.producto.findMany({
        where: {
          id: { in: input.productos.map((p) => p.productoId) },
        },
      });

      let total = 0;

      for (const p of input.productos) {
        const prod = productosDB.find((item) => item.id === p.productoId);
        if (!prod) {
          throw new TRPCError({ code: "NOT_FOUND", message: `Producto ID ${p.productoId} no existe` });
        }

        if (prod.cantidad < p.cantidad) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Stock insuficiente para el producto "${prod.nombre}"`,
          });
        }

        if (!(prod.precio && typeof prod.precio.toNumber === "function")) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Precio inválido para producto ID ${p.productoId}`,
          });
        }

        total += prod.precio.toNumber() * p.cantidad;
      }

      const venta = await db.venta.create({
        data: {
          clienteId: input.clienteId,
          fecha: new Date(),
          total,
        },
      });

      await db.ventaProducto.createMany({
        data: input.productos.map((p) => {
          const prod = productosDB.find((item) => item.id === p.productoId);
          if (!prod || typeof prod.precio.toNumber !== "function") {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Precio inválido para producto ID ${p.productoId}`,
            });
          }

          const subtotal = prod.precio.toNumber() * p.cantidad;

          return {
            ventaId: venta.id,
            productoId: p.productoId,
            cantidad: p.cantidad,
            subtotal,
          };
        }),
      });

      for (const p of input.productos) {
        await db.producto.update({
          where: { id: p.productoId },
          data: {
            cantidad: { decrement: p.cantidad },
          },
        });
      }

      return venta;
    }),
});
