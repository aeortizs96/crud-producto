
# 🧾 Sistema de Ventas con Control de Inventario


## ⚙️ Tecnologías implementadas

- T3 Stack 
- Next.js 
- React Hooks 
- Tailwind CSS
- TypeScript
- AntDesign 
- MySQL 
- Prisma ORM
- TRPC Router
- Docker 

## 📦 Estructura del proyecto

src/  
├── app/  
│   ├── venta/ → Página principal de ventas (formulario + historial)  
│   ├── clientes/ → CRUD de clientes  
│   └── inventario/ → CRUD de productos  
├── components/  
│   └── VentaForm.tsx → Componente del formulario de ventas  
├── server/  
│   ├── api/  
│   │   ├── routers/ → Routers TRPC (venta.ts, cliente.ts, producto.ts)  
│   └── db/  
│       └── prisma.ts → Conexión a Prisma  

## 🚀 Instrucciones para ejecutar el proyecto

1. Clonar el repositorio  
   git clone <URL_DEL_REPOSITORIO>  
   cd crud-producto

2. Instalar dependencias  
   npm install  

3. Configurar el archivo `.env`  
   Crea un archivo `.env` en la raíz del proyecto con:

   DATABASE_URL="mysql://[USUARIO]:[CONTRASENA]@localhost:3306/crud-producto"

   
4. Ejecutar el script - `./start-database.sh`

5. Aplicar el esquema de Prisma  
   npm run db:push  
   npm run db:studio

6. Iniciar el servidor de desarrollo  
   npm run dev  
   Luego acceder a http://localhost:3000


## 🚧 Limitaciones actuales

- La tabla de historial no está mostrando las ventas en la interfaz web, aunque los datos sí se registran correctamente en la base