"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/trpc/client";

const clienteSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  apellidoP: z.string().min(1, "El apellido paterno es obligatorio"),
  apellidoM: z.string().min(1, "El apellido materno es obligatorio"),
  ci: z.string().min(1, "El CI es obligatorio"),
  correo: z.string().email("Correo inválido"),
  numero: z.string().min(1, "El número es obligatorio"),
  nit: z.string().min(1, "El NIT es obligatorio"),
  nacimiento: z.coerce.date(),
  pais: z.string().min(1, "El país es obligatorio"),
});

type ClienteFormValues = z.infer<typeof clienteSchema>;

export default function ClientesPage() {
  const [clienteEditando, setClienteEditando] = useState<number | null>(null);

  const form = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nombre: "",
      apellidoP: "",
      apellidoM: "",
      ci: "",
      correo: "",
      numero: "",
      nit: "",
      nacimiento: undefined,
      pais: "",
    },
  });

  const { data: clientes, isLoading, refetch } = api.cliente.getAll.useQuery();

  const crearCliente = api.cliente.create.useMutation({
    onSuccess: () => {
      form.reset();
      void refetch();
    },
  });

  const actualizarCliente = api.cliente.update.useMutation({
    onSuccess: () => {
      setClienteEditando(null);
      form.reset();
      void refetch();
    },
  });

  const eliminarCliente = api.cliente.delete.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const cargarClienteParaEditar = (cliente: ClienteFormValues & { id: number }) => {
    form.reset({ ...cliente });
    setClienteEditando(cliente.id);
  };

  const manejarEnvio = form.handleSubmit((values) => {
    if (clienteEditando) {
      actualizarCliente.mutate({ id: clienteEditando, ...values });
    } else {
      crearCliente.mutate(values);
    }
  });

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        {clienteEditando ? "Editar Cliente" : "Gestión de Clientes"}
      </h1>

      {/* Formulario */}
      <form onSubmit={manejarEnvio} className="bg-gray-100 p-4 rounded space-y-4">
        <h2 className="text-lg font-semibold">
          {clienteEditando ? "Modificar datos del cliente" : "Agregar nuevo cliente"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input {...form.register("nombre")} placeholder="Nombre" className="p-2 border rounded" />
          <input {...form.register("apellidoP")} placeholder="Apellido Paterno" className="p-2 border rounded" />
          <input {...form.register("apellidoM")} placeholder="Apellido Materno" className="p-2 border rounded" />
          <input {...form.register("ci")} placeholder="CI" className="p-2 border rounded" />
          <input {...form.register("correo")} placeholder="Correo" className="p-2 border rounded" />
          <input {...form.register("numero")} placeholder="Teléfono" className="p-2 border rounded" />
          <input {...form.register("nit")} placeholder="NIT" className="p-2 border rounded" />
          <input {...form.register("nacimiento")} type="date" className="p-2 border rounded" />
          <input {...form.register("pais")} placeholder="País de nacimiento" className="p-2 border rounded" />
        </div>

        <div className="flex gap-4">
          <button type="submit" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {clienteEditando ? "Guardar cambios" : "Crear Cliente"}
          </button>

          {clienteEditando && (
            <button
              type="button"
              onClick={() => {
                form.reset();
                setClienteEditando(null);
              }}
              className="mt-4 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      {/* Tabla de clientes */}
      {isLoading ? (
        <p className="text-gray-600">Cargando clientes...</p>
      ) : (
        <table className="w-full bg-white shadow-md rounded overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Nombre completo</th>
              <th className="p-2 text-left">CI</th>
              <th className="p-2 text-left">Correo</th>
              <th className="p-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes?.map((c) => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="p-2">{c.id}</td>
                <td className="p-2">
                  {c.nombre} {c.apellidoP} {c.apellidoM}
                </td>
                <td className="p-2">{c.ci}</td>
                <td className="p-2">{c.correo}</td>
                <td className="p-2 flex gap-2">
                  <button
                    onClick={() => cargarClienteParaEditar(c)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => eliminarCliente.mutate({ id: c.id })}
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
