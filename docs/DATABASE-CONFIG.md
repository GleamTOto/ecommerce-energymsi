# Configuración de Base de Datos: Neon vs Docker

## Resumen de Cambios

Se ha configurado el proyecto para usar **Neon PostgreSQL** como base de datos principal, eliminando la dependencia de Docker Compose para el desarrollo local.

### Archivos Creados/Modificados

✅ **Creados:**
- `.env.example` - Template de variables de entorno con formato Neon
- `docs/NEON-SETUP.md` - Guía detallada de configuración de Neon
- `QUICKSTART.md` - Guía rápida de inicio (3 pasos)

✅ **Modificados:**
- `README.md` - Actualizado con instrucciones de Neon como método principal
- `.gitignore` - Ajustado para permitir commit de `.env.example`
- `package.json` - Agregado script `npm run setup`

✅ **Mantenido (opcional):**
- `docker-compose.yml` - Conservado como alternativa para desarrollo offline

---

## Comparación: Neon vs Docker

### Neon (Recomendado) ✅

**Ventajas:**
- ✅ **Zero dependencias**: Solo necesitas Node.js, no Docker
- ✅ **Setup en 2 minutos**: Crear cuenta → copiar connection string → listo
- ✅ **Multi-OS**: Funciona nativamente en Windows, Mac, Linux
- ✅ **Database branching**: Crea branches de la DB como Git
- ✅ **Accesible desde cualquier lugar**: No necesitas tu máquina local
- ✅ **Free tier generoso**: 0.5 GiB storage, suficiente para desarrollo
- ✅ **Connection pooling**: Mejor performance integrado
- ✅ **No consume recursos locales**: La DB corre en la cloud

**Desventajas:**
- ⚠️ Requiere conexión a internet
- ⚠️ Latencia mínima (ms adicionales vs local)
- ⚠️ Dependencia de servicio externo (pero Neon tiene 99.9% uptime)

**Ideal para:**
- Equipos distribuidos
- Desarrolladores que cambian de máquina frecuentemente
- Proyectos donde la simplicidad de setup es prioridad
- Desarrollo de features con database branching

### Docker Compose (Alternativa)

**Ventajas:**
- ✅ Funciona offline
- ✅ Latencia mínima (localhost)
- ✅ Control total de la base de datos
- ✅ Sin dependencia de servicios externos

**Desventajas:**
- ❌ Requiere Docker instalado (problemas en Windows/Mac)
- ❌ Consume recursos locales (RAM, CPU)
- ❌ Setup más complejo para nuevos desarrolladores
- ❌ Problemas de compatibilidad entre OS
- ❌ No puedes acceder a la DB desde otra máquina

**Ideal para:**
- Desarrollo offline
- Proyectos con requisitos de privacidad estrictos
- Cuando necesitas control total de la infraestructura

---

## Flujo de Trabajo Recomendado con Neon

### Para Nuevos Desarrolladores

```bash
# 1. Clonar repo
git clone <repo-url>
cd ecommerce-energyMSI

# 2. Instalar dependencias
npm install

# 3. Configurar Neon (2 minutos)
cp .env.example .env
# Editar .env con connection string de Neon

# 4. Setup completo
npm run setup

# 5. Correr
npm run dev
```

### Para Desarrolladores Existentes

Si ya tienes el proyecto corriendo con Docker:

```bash
# 1. Crear cuenta en Neon y obtener connection string
# 2. Actualizar .env
# 3. Migrar datos (opcional) o solo seed
npm run db:seed

# 4. Ya puedes apagar Docker
docker-compose down
```

---

## Estructura de Connection Strings

### Neon
```
postgresql://username:password@host.amazonaws.neon.tech/neondb?sslmode=require
```

### Docker Local
```
postgresql://energyMSI:energyMSI123@localhost:5490/energyMSI_shop?schema=public
```

**Diferencias clave:**
- Neon usa `sslmode=require` (obligatorio)
- Docker usa `schema=public` (opcional)
- Neon tiene host remoto, Docker usa `localhost`

---

## Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run setup` | **Nuevo**: Genera Prisma Client + migraciones + seed |
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run db:seed` | Siembra datos iniciales |
| `npx prisma studio` | GUI para explorar la DB |
| `npx prisma migrate reset` | Resetea DB completa |

---

## Migración de Datos: Docker → Neon

Si tienes datos importantes en Docker y quieres moverlos a Neon:

### Opción 1: Solo Seed (Recomendado)
```bash
# Simplemente siembra datos de prueba en Neon
npm run db:seed
```

### Opción 2: Exportar/Importar
```bash
# Exportar desde Docker
docker exec energyMSI-db pg_dump -U energyMSI energyMSI_shop > backup.sql

# Importar a Neon
psql "TU_CONNECTION_STRING_NEON" < backup.sql
```

---

## Costos de Neon

**Free Tier:**
- Storage: 0.5 GiB
- Compute: 190 horas/month
- Data transfer: 1 GB/month

**Para desarrollo local es prácticamente imposible exceder estos límites.**

Si llegas al límite:
- Espera al próximo mes (se resetean)
- O upgrade a plan pago ($19/month)

---

## Decisiones Técnicas

### ¿Por qué no eliminar Docker Compose completamente?

Lo mantenemos como **fallback opcional** porque:
1. Algunos desarrolladores pueden preferir trabajo offline
2. Proyectos con requisitos de privacidad pueden necesitarlo
3. No rompe el flujo de trabajo existente

**Recomendación**: Usa Neon como default, Docker solo si es necesario.

### ¿Por qué `.env.example` y no `.env`?

- `.env` contiene credenciales reales → **NO se commitea**
- `.env.example` es un template → **SÍ se commitea**
- Cada desarrollador copia `.env.example` → `.env` y llena sus credenciales

### ¿Por qué `sslmode=require`?

Neon **requiere** conexiones SSL por seguridad. Sin este parámetro, la conexión fallará.

---

## Próximos Pasos

1. ✅ Crear cuenta en Neon (si no la tienes)
2. ✅ Crear proyecto en Neon
3. ✅ Copiar connection string a `.env`
4. ✅ Ejecutar `npm run setup`
5. ✅ Ejecutar `npm run dev`
6. ✅ (Opcional) Apagar Docker si ya no lo necesitas

---

## Soporte

- **Guía rápida**: Ver `QUICKSTART.md`
- **Guía completa**: Ver `docs/NEON-SETUP.md`
- **Documentación Neon**: https://neon.tech/docs/
- **Prisma + Neon**: https://www.prisma.io/docs/guides/database/neon
