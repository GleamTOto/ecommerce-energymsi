# Guía de Configuración de Neon PostgreSQL

## ¿Qué es Neon?

Neon es una base de datos PostgreSQL serverless en la nube con un generoso free tier perfecto para desarrollo.

**Características:**
- ✅ 0.5 GiB de almacenamiento gratuito
- ✅ Connection pooling integrado
- ✅ Database branching (como Git para bases de datos)
- ✅ Auto-scaling y pause/resume automático
- ✅ Compatible con PostgreSQL estándar

## Configuración Paso a Paso

### 1. Crear Cuenta en Neon

1. Ve a [https://neon.tech/](https://neon.tech/)
2. Haz clic en "Sign Up" (puedes usar GitHub, Google o email)
3. Verifica tu cuenta si es necesario

### 2. Crear un Proyecto

1. Después de iniciar sesión, haz clic en "Create Project"
2. Configura tu proyecto:
   - **Name**: `energyMSI-dev` (o el nombre que prefieras)
   - **Region**: Elige la más cercana a ti (ej: `South America (São Paulo)` si estás en LATAM)
   - **Postgres version**: 16 (la más reciente estable)
3. Haz clic en "Create Project"

### 3. Obtener el Connection String

1. Una vez creado el proyecto, verás el dashboard
2. En la sección "Connection Details", verás el connection string
3. El formato es:
   ```
   postgresql://username:password@host.amazonaws.neon.tech/neondb?sslmode=require
   ```
4. Haz clic en el ícono de copiar para copiar el connection string completo

### 4. Configurar el Proyecto Local

1. En la raíz del proyecto, copia el archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```

2. Abre el archivo `.env` y reemplaza la línea `DATABASE_URL`:
   ```bash
   DATABASE_URL="postgresql://username:password@host.amazonaws.neon.tech/neondb?sslmode=require"
   ```
   
   **Importante**: Mantén el parámetro `?sslmode=require` al final, es necesario para Neon.

3. Guarda el archivo `.env`

### 5. Ejecutar Migraciones y Seed

```bash
# Ejecutar migraciones de Prisma
npx prisma migrate dev

# Sembrar datos iniciales (productos, categorías, usuarios)
npm run db:seed
```

### 6. Iniciar el Servidor

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) y deberías ver la aplicación funcionando.

## Usuarios de Prueba

Después de ejecutar el seed, puedes iniciar sesión con:

| Email               | Password | Rol      |
| ------------------- | -------- | -------- |
| admin@energyMSI.com | admin123 | ADMIN    |
| juan@email.com      | admin123 | CUSTOMER |

## Solución de Problemas

### Error: "connection refused" o "timeout"

**Causa**: El connection string es incorrecto o la base de datos está en pause.

**Solución**:
1. Verifica que copiaste el connection string completo desde Neon
2. Asegúrate de que incluye `?sslmode=require` al final
3. Ve al dashboard de Neon y verifica que el proyecto está activo (no en pause)

### Error: "SSL required"

**Causa**: Falta el parámetro `sslmode=require` en el connection string.

**Solución**: Agrega `?sslmode=require` al final de tu `DATABASE_URL` en `.env`

### Error: "relation does not exist"

**Causa**: No has ejecutado las migraciones.

**Solución**:
```bash
npx prisma migrate dev
```

### Error: "no data" o tabla vacía

**Causa**: No has ejecutado el seed.

**Solución**:
```bash
npm run db:seed
```

## Neon Dashboard - Comandos Útiles

### Ver tu base de datos

Desde el dashboard de Neon puedes:
- Ver tablas y datos en "Tables"
- Ejecutar queries SQL en "SQL Editor"
- Ver métricas de uso en "Monitoring"

### Resetear la base de datos

Si necesitas empezar de cero:

```bash
# Desde tu terminal local
npx prisma migrate reset
```

Esto borrará todos los datos y ejecutará migraciones + seed nuevamente.

### Database Branching (Feature opcional)

Neon permite crear branches de tu base de datos (como Git):

1. En el dashboard, ve a "Branches"
2. Haz clic en "Create Branch"
3. Dale un nombre (ej: `feature-new-products`)
4. Copia el connection string del branch
5. Úsalo en tu `.env.local` para desarrollar esa feature aislada

**Ventaja**: Puedes probar cambios de schema o datos sin afectar la base principal.

## Migrar de Docker a Neon

Si ya tenías datos en Docker y quieres migrarlos a Neon:

### Opción 1: Solo seed (Recomendado para desarrollo)

Simplemente ejecuta el seed en Neon:
```bash
npm run db:seed
```

### Opción 2: Exportar/Importar datos

Si tienes datos personalizados en Docker:

```bash
# 1. Exportar desde Docker
docker exec energyMSI-db pg_dump -U energyMSI energyMSI_shop > backup.sql

# 2. Importar a Neon (usa el connection string de Neon)
psql "postgresql://username:password@host.amazonaws.neon.tech/neondb?sslmode=require" < backup.sql
```

## Costos

Neon tiene un free tier generoso:
- **Storage**: 0.5 GiB
- **Compute**: 190 horas/month de compute time
- **Data transfer**: 1 GB/month

Para desarrollo local, es muy difícil exceder estos límites. Si llegas al límite, Neon te notificará y puedes:
1. Esperar al próximo mes (se resetean los límites)
2. Upgrade a plan pago ($19/month para 10 GiB)

## Recursos Adicionales

- [Documentación de Neon](https://neon.tech/docs/)
- [Neon Serverless Driver](https://neon.tech/docs/serverless/serverless-driver) (para edge functions)
- [Prisma con Neon](https://www.prisma.io/docs/guides/database/neon)
