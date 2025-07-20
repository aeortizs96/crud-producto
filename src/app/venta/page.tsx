"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Table, Select, InputNumber, Button, Tag, message } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { z } from "zod";
import { api } from "~/trpc/client";

const schema = z.object({
  clienteId: z.number().min(1, "Selecciona un cliente"),
  productos: z
    .array(
      z.object({
        productoId: z.number().min(1, "Selecciona un producto"),
        cantidad: z.number().min(1, "Cantidad inválida"),
      })
    )
    .min(1, "Agrega al menos un producto"),
});

type FormData = z.infer<typeof schema>;

export default function VentaPage() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { clienteId: undefined, productos: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "productos",
  });

  const { data: clientes } = api.cliente.listar.useQuery();
  const { data: productos } = api.producto.listar.useQuery();
  const { data: ventas } = api.venta.listar.useQuery();
  const registrar = api.venta.crear.useMutation();

  const [total, setTotal] = useState(0);
  const [filtroCliente, setFiltroCliente] = useState<number | undefined>();
  const [filtroProducto, setFiltroProducto] = useState<number | undefined>();

  useEffect(() => {
    const current = form.getValues("productos");
    const sum = current.reduce((acc, item) => {
      const prod = productos?.find((p) => p.id === item.productoId);
      return acc + (prod ? Number(prod.precio.toString()) * item.cantidad : 0);
    }, 0);
    setTotal(sum);
  }, [form.watch("productos"), productos]);

  const onSubmit = form.handleSubmit((values) => {
    registrar.mutate(values, {
      onSuccess: () => {
        message.success("Venta registrada correctamente ✅");
        form.reset();
        setTotal(0);
      },
      onError: (err) => {
        message.error(`Error: ${err.message}`);
      },
    });
  });

  const ventasFiltradas = ventas?.filter((venta) => {
    const porCliente = filtroCliente ? venta.clienteId === filtroCliente : true;
    const porProducto = filtroProducto
      ? venta.productos.some((vp) => vp.productoId === filtroProducto)
      : true;
    return porCliente && porProducto;
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Ventas</h1>

      {/* Formulario */}
      <form onSubmit={onSubmit} className="bg-white p-6 rounded shadow space-y-4">
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

        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-3 items-center">
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

        <Button
          type="dashed"
          onClick={() => append({ productoId: 0, cantidad: 1 })}
        >
          + Agregar producto
        </Button>

        <p className="font-semibold">Total: Bs. {total.toFixed(2)}</p>

        <Button type="primary" htmlType="submit">
          Registrar venta
        </Button>
      </form>

      {/* Historial */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Historial de ventas</h2>

        <div className="flex gap-4 mb-2">
          <Select
            placeholder="Filtrar por cliente"
            allowClear
            className="w-1/2"
            options={clientes?.map((c) => ({
              label: `${c.nombre} ${c.apellidoP}`,
              value: c.id,
            }))}
            onChange={(val) => setFiltroCliente(val)}
          />
          <Select
            placeholder="Filtrar por producto"
            allowClear
            className="w-1/2"
            options={productos?.map((p) => ({
              label: p.nombre,
              value: p.id,
            }))}
            onChange={(val) => setFiltroProducto(val)}
          />
        </div>

        <Table
          dataSource={ventasFiltradas}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          bordered
          columns={[
            {
              title: "Cliente",
              key: "cliente",
              render: (_, record) =>
                record.cliente
                  ? `${record.cliente.nombre} ${record.cliente.apellidoP}`
                  : "Cliente no disponible",
            },
            {
              title: "Fecha",
              dataIndex: "fecha",
              key: "fecha",
              render: (fecha) => dayjs(fecha).format("DD/MM/YYYY HH:mm"),
            },
            {
              title: "Productos",
              key: "productos",
              render: (_, record) =>
                record.productos.map((vp, i) => (
                  <Tag key={i}>
                    {vp.producto.nombre} x{vp.cantidad}
                  </Tag>
                )),
            },
            {
              title: "Total (Bs.)",
              dataIndex: "total",
              key: "total",
            },
          ]}
        />
      </div>
    </div>
  );
}
