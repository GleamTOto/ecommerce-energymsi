# EnergyMSI

E-commerce de productos de computación construido con Next.js 16, TypeScript y Tailwind CSS.

## Descripción

EnergyMSI es una tienda online especializada en hardware, periféricos y componentes de computación. Incluye:

- **Tienda pública**: Catálogo con filtros, carrito y checkout
- **Panel de usuario**: Perfil, historial de pedidos y direcciones
- **Panel de administración**: Gestión de productos, usuarios y pedidos

## Stack Tecnológico

| Tecnología      | Uso                    |
| --------------- | ---------------------- |
| Next.js 16      | Framework (App Router) |
| TypeScript      | Lenguaje               |
| Tailwind CSS v4 | Estilos                |
| shadcn/ui       | Componentes UI         |
| Prisma          | ORM                    |
| PostgreSQL      | Base de datos          |
| Zustand         | Estado global          |
| NextAuth.js     | Autenticación          |

## Requisitos

- Node.js 18+
- Cuenta gratuita en [Neon](https://neon.tech/) (PostgreSQL en la cloud)
- Docker (opcional, solo si prefieres base de datos local)

## Instalación Rápida

### 1. Clonar e instalar dependencias

```bash
git clone <repo-url>
cd ecommerce-energyMSI
npm install
```

### 2. Configurar base de datos Neon (Recomendado)

**Paso 1:** Crear cuenta gratuita en [neon.tech](https://neon.tech/)

**Paso 2:** Crear un nuevo proyecto (dale un nombre como "energyMSI-dev")

**Paso 3:** Copiar el connection string desde el dashboard de Neon

**Paso 4:** Configurar variables de entorno:

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env y pegar tu connection string de Neon
# El formato es: postgresql://user:password@host/database?sslmode=require
```

**Paso 5:** Ejecutar migraciones y seed:

```bash
# Opción 1: Script de setup completo (recomendado)
npm run setup

# Opción 2: Comandos individuales
npx prisma generate
npx prisma migrate dev
npm run db:seed
```

### 3. Iniciar el servidor

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

### Alternativa: Base de datos local con Docker

Si prefieres no usar Neon, puedes correr PostgreSQL localmente con Docker:

```bash
# Levantar la base de datos
docker-compose up -d

# Configurar .env con credenciales locales
# DATABASE_URL="postgresql://energyMSI:energyMSI123@localhost:5490/energyMSI_shop?schema=public"

# Ejecutar migraciones y seed
npx prisma migrate dev
npm run db:seed
```

## Usuarios de Prueba

Después de ejecutar `npm run db:seed`, estos usuarios estarán disponibles:

| Email              | Password | Rol      |
| ------------------ | -------- | -------- |
| admin@energyMSI.com | admin123 | ADMIN    |
| juan@email.com     | admin123 | CUSTOMER |

## Desarrollo

```bash
# Servidor de desarrollo
npm run dev

# Abrir http://localhost:3000
```

## Scripts Disponibles

| Script          | Descripción                                              |
| --------------- | -------------------------------------------------------- |
| `npm run setup` | Configura DB completa: generate + migrate + seed         |
| `npm run dev`   | Inicia servidor de desarrollo                            |
| `npm run build` | Genera build de producción                               |
| `npm run start` | Inicia servidor de producción                            |
| `npm run lint`  | Ejecuta ESLint                                           |
| `npm run db:seed` | Siembra datos iniciales (productos, usuarios)          |

## Estructura del Proyecto

```
src/
├── app/
│   ├── (shop)/          # Rutas públicas (tienda)
│   ├── (admin-panel)/   # Panel de administración
│   ├── (auth)/          # Login y registro
│   └── api/             # API Routes
├── components/
│   ├── ui/              # shadcn/ui
│   ├── layout/          # Header, Footer, Nav
│   ├── products/        # Componentes de productos
│   ├── cart/            # Carrito
│   └── admin/           # Panel admin
├── data/                # Datos mock
├── lib/                 # Utilidades
├── stores/              # Zustand stores
└── types/               # Tipos TypeScript
```

## Documentación

- [PRD](./docs/PRD.md) - Documento de requisitos del producto
- [Plan](./docs/PLAN.md) - Plan de implementación
- [Modelo de datos](./docs/DATA-MODEL.md) - Schema de base de datos
- [Páginas](./docs/PAGES.md) - Listado de rutas y endpoints

## Licencia

MIT
