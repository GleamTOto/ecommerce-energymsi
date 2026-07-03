# Quick Start - EnergyMSI

## Setup en 3 Pasos

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar base de datos Neon
```bash
# Copiar template
cp .env.example .env

# Editar .env y pegar tu connection string de Neon
# Obtener desde: https://console.neon.tech/
# Formato: postgresql://user:pass@host/db?sslmode=require
```

### 3. Setup completo y correr
```bash
npm run setup
npm run dev
```

Listo! Abre http://localhost:3000

---

## Usuarios de Prueba

| Email               | Password | Rol   |
| ------------------- | -------- | ----- |
| admin@energyMSI.com | admin123 | ADMIN |
| juan@email.com      | admin123 | USER  |

---

## Comandos Útiles

```bash
# Resetear base de datos completa
npx prisma migrate reset

# Ver estado de migraciones
npx prisma migrate status

# Abrir Prisma Studio (GUI de la DB)
npx prisma studio

# Generar Prisma Client después de cambios en schema
npx prisma generate
```

---

## ¿Problemas?

- **Error de conexión**: Verifica que `.env` tenga el connection string correcto de Neon con `?sslmode=require`
- **Sin datos**: Ejecuta `npm run db:seed`
- **Schema desactualizado**: Ejecuta `npm run setup`

Guía completa: [docs/NEON-SETUP.md](./docs/NEON-SETUP.md)
