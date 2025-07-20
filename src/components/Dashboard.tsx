"use client";

import { VentaForm } from "./VentaForm";
import Link from "next/link";

export const Dashboard = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard de Ventas</h1>

      {/* 🧾 Sección: Registrar nueva venta */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Registrar nueva venta</h2>
        <VentaForm />
      </div>

      {/* 🚀 Accesos rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/inventario"
          className="bg-blue-100 hover:bg-blue-200 text-blue-900 font-medium text-center p-4 rounded shadow"
        >
          📦 Ver Inventario
        </Link>
        <Link
          href="/clientes"
          className="bg-green-100 hover:bg-green-200 text-green-900 font-medium text-center p-4 rounded shadow"
        >
          🧍‍♂️ Gestionar Clientes
        </Link>
        <Link
  href="/venta"
  className="bg-purple-100 hover:bg-purple-200 text-purple-900 font-medium text-center p-4 rounded shadow"
>
  📋 Historial de Ventas
</Link>
      </div>
    </div>
  );
};
