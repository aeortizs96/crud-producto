"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/trpc/client";
import { useEffect, useState } from "react";
import { Select, InputNumber, Button, message } from "antd";




// ✅ Esquema Zod
const ventaSchema = z.object({
  clienteId: z.number().min(1, "Selecciona un cliente"),
  productos: z
    .array(
      z.object({
        productoId: z.number().min(1, "Selecciona un producto"),
        cantidad: z.number().min(1, "Cantidad debe ser mayor a 0"),
      })
    )
    .min(1, "Agrega al menos un producto"),
});

type VentaInput = z.infer<typeof ventaSchema>;

export const VentaForm = () => {
  const form = useForm<VentaInput>({
    resolver: zodResolver(ventaSchema),
    defaultValues: {
      clienteId: undefined,
      productos: [],
    },
  });

  const { data: clientes } = api.cliente.listar.useQuery();
  const { data: productos } = api.producto.listar.useQuery();
  const registrar = api.venta.crear.useMutation();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "productos",
  });

  const [total, setTotal] = useState(0);

  // 🧮 Cálculo total
  useEffect(() => {
    const current = form.getValues("productos");
    const sum = current.reduce((acc, item) => {
      const prod = productos?.find((p) => p.id === item.productoId);
      return acc + (prod ? Number(prod.precio) * item.cantidad : 0);
    }, 0);
    setTotal(sum);
  }, [form.watch("productos"), productos]);

  // 🧩 Registrar venta
  
  const onSubmit = form.handleSubmit((values) => {
    registrar.mutate(values, {
      onSuccess: () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        message.success("Venta registrada correctamente ✅");
        form.reset();
        setTotal(0);
      },
      onError: (err) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        message.error(`Error: ${err.message}`);
      },
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6 bg-white p-6 shadow rounded">
      {/* 🧍‍♂️ Selector de cliente */}
      <Controller
        control={form.control}
        name="clienteId"
        render={({ field }) => (
          <Select
            {...field}
            placeholder="Selecciona un cliente"
            className="w-full"
            options={clientes?.map((c) => ({
              label: `${c.nombre} ${c.apellidoP}`,
              value: c.id,
            }))}
          />
        )}
      />

      {/* 📦 Lista de productos */}
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-3 items-center">
            {/* 🔍 Selector de producto */}
            <Controller
              control={form.control}
              name={`productos.${index}.productoId`}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Producto"
                  className="w-2/3"
                  options={productos?.map((p) => ({
                    label: p.nombre,
                    value: p.id,
                  }))}
                />
              )}
            />

            {/* 🔢 Cantidad */}
            <Controller
              control={form.control}
              name={`productos.${index}.cantidad`}
              render={({ field }) => (
                <InputNumber {...field} min={1} className="w-20" />
              )}
            />

            <Button danger onClick={() => remove(index)}>
              Eliminar
            </Button>
          </div>
        ))}

        <Button type="dashed" onClick={() => append({ productoId: 0, cantidad: 1 })}>
          + Agregar producto
        </Button>
      </div>

      {/* 📊 Total de venta */}
      <p className="font-bold">Total: Bs. {total.toFixed(2)}</p>

      {/* 📝 Enviar venta */}
      <Button type="primary" htmlType="submit">
        Registrar venta
      </Button>
    </form>
  );
};
