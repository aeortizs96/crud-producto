"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/trpc/client";
import { type Prisma } from "@prisma/client";

const schema = z.object({
  nombre: z.string().min(1),
  descripcion: z.string().min(1),
  cantidad: z.number().min(0),
  precio: z.number().min(0),
});

type ProductoInput = z.infer<typeof schema>;

export default function InventarioPage() {
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const form = useForm<ProductoInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: "",
      descripcion: "",
      cantidad: 0,
      precio: 0,
    },
  });

  const { data: productos, isLoading, refetch } = api.producto.listar.useQuery();

  const crear = api.producto.crear.useMutation({
    onSuccess: () => {
      form.reset();
      void refetch();
    },
  });

  const actualizar = api.producto.actualizar.useMutation({
    onSuccess: () => {
      setEditandoId(null);
      form.reset();
      void refetch();
    },
  });

  const eliminar = api.producto.eliminar.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const cargarParaEditar = (p: {
    id: number;
    nombre: string;
    descripcion: string;
    cantidad: number;
    precio: Prisma.Decimal; 
  }) => {
    form.reset({
      nombre: p.nombre,
      descripcion: p.descripcion,
      cantidad: p.cantidad,
      precio: Number(p.precio), //  Conversión aquí
    });
    setEditandoId(p.id);
  };

  const onSubmit = form.handleSubmit((values) => {
    if (editandoId) {
      actualizar.mutate({ id: editandoId, ...values });
    } else {
      crear.mutate(values);
    }
  });

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">Inventario de Productos</h1>

      <form onSubmit={onSubmit} className="bg-gray-100 p-4 rounded space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input {...form.register("nombre")} placeholder="Nombre" className="p-2 border rounded" />
          <input {...form.register("descripcion")} placeholder="Descripción" className="p-2 border rounded" />
          <input
            {...form.register("cantidad", { valueAsNumber: true })}
            type="number"
            placeholder="Cantidad"
            className="p-2 border rounded"
          />
          <input
            {...form.register("precio", { valueAsNumber: true })}
            type="number"
            step="0.01"
            placeholder="Precio"
            className="p-2 border rounded"
          />
        </div>

        <div className="flex gap-4 pt-2">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {editandoId ? "Guardar cambios" : "Crear producto"}
          </button>

          {editandoId && (
            <button
              type="button"
              onClick={() => {
                form.reset();
                setEditandoId(null);
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {isLoading ? (
        <p>Cargando productos...</p>
      ) : (
        <table className="w-full mt-6 bg-white shadow-md rounded overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Nombre</th>
              <th className="p-2">Descripción</th>
              <th className="p-2">Cantidad</th>
              <th className="p-2">Precio</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos?.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-2">{p.id}</td>
                <td className="p-2">{p.nombre}</td>
                <td className="p-2">{p.descripcion}</td>
                <td className="p-2">{p.cantidad}</td>
                <td className="p-2">Bs. {Number(p.precio).toFixed(2)}</td>
                <td className="p-2 flex gap-2">
                  <button
                    onClick={() => cargarParaEditar(p)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => eliminar.mutate({ id: p.id })}
                    className="text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
