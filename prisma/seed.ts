import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding database...")

  // Clear existing data
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.address.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.supplier.deleteMany()
  await prisma.user.deleteMany()

  // Create Categories
  const categoriesData = [
    { name: "Baterias", slug: "baterias", icon: "Package", color: "#B62020", description: "Baterías selladas de plomo-ácido para uso general" },
    { name: "Baterias Para UPS", slug: "baterias-para-ups", icon: "Package", color: "#B62920", description: "Baterías de reemplazo para sistemas UPS / SAI" },
    { name: "Movilidad Eléctrica", slug: "movilidad-electrica", icon: "Package", color: "#B64420", description: "Baterías y componentes para vehículos eléctricos" },
    { name: "Inversores", slug: "inversores", icon: "Package", color: "#B64D20", description: "Inversores de corriente DC/AC de diferentes potencias" },
    { name: "Multimetros", slug: "multimetros", icon: "Package", color: "#B67120", description: "Multimetros y pinzas de medicion" },
    { name: "Ups Y Sistemas De Proteccion", slug: "ups-y-sistemas-de-proteccion", icon: "Package", color: "#B67A20", description: "Ups domesticas y empresarial" },
    { name: "Cargadores", slug: "cargadores", icon: "Package", color: "#B68C20", description: "Cargadores para baterias de plomo y lithium" },
  ]

  const categories: Record<string, string> = {}
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat })
    categories[cat.slug] = created.id
  }
  console.log(`Created ${categoriesData.length} categories`)

  // Create Suppliers
  const suppliersData = [
    { name: "Netion", slug: "netion", color: "#2563EB" },
    { name: "Green Point", slug: "green-point", color: "#16A34A" },
    { name: "MovilTronics", slug: "moviltronics", color: "#DC2626" },
    { name: "Truper", slug: "truper", color: "#EA580C" },
    { name: "Unitec", slug: "unitec", color: "#7C3AED" },
    { name: "Importronic", slug: "importronic", color: "#0891B2" },
    { name: "Otros", slug: "otros", color: "#6B7280" },
    { name: "EvoBike", slug: "evobike", color: "#DB2777" },
  ]

  const suppliers: Record<string, string> = {}
  for (const supplier of suppliersData) {
    const created = await prisma.supplier.create({ data: supplier })
    suppliers[supplier.name] = created.id
  }
  console.log(`Created ${suppliersData.length} suppliers`)

  // Create Products (sample - use import script for full 106 products)
  const productsData = [
    {
      name: "Bateria Netion 12v 1.2ah",
      slug: "bateria-netion-12v-12ah",
      sku: "NBAT-1.2",
      supplier: "Netion",
      category: "baterias",
      price: 30000,
      cost: 20994,
      margin: 0.30,
      unit: "UND",
      minStock: 5,
      status: "ACTIVE" as const,
      images: [],
      description: "Bateria Netion 12v 1.2ah",
      specs: {},
      stock: 7,
      isNew: false,
      isFeatured: true,
    },
    {
      name: "Bateria Netion 12v 2ah",
      slug: "bateria-netion-12v-2ah",
      sku: "NBAT-2",
      supplier: "Netion",
      category: "baterias",
      price: 40000,
      cost: 25513,
      margin: 0.36,
      unit: "UND",
      minStock: 5,
      status: "ACTIVE" as const,
      images: [],
      description: "Bateria Netion 12v 2ah",
      specs: {},
      stock: 8,
      isNew: false,
      isFeatured: true,
    },
  ]

  for (const product of productsData) {
    await prisma.product.create({
      data: {
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        description: product.description,
        price: product.price,
        cost: product.cost,
        margin: product.margin,
        unit: product.unit,
        minStock: product.minStock,
        status: product.status,
        stock: product.stock,
        images: product.images,
        specs: product.specs,
        isNew: product.isNew,
        isFeatured: product.isFeatured,
        categoryId: categories[product.category],
        supplierId: suppliers[product.supplier],
      },
    })
  }
  console.log(`Created ${productsData.length} products`)

  // Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@energyMSI.com",
      password: "$2b$10$xsSrc3i9rvBX.uLhXeaMteDUia8iKTnIgt8SoPwY9MFMopOux4G5.", // password: admin123
      name: "Admin User",
      phone: "+51 999 888 777",
      role: "ADMIN",
      status: "ACTIVE",
    },
  })
  console.log(`Created admin user: ${adminUser.email}`)

  // Create Test Customer
  const customerUser = await prisma.user.create({
    data: {
      email: "juan@email.com",
      password: "$2b$10$xsSrc3i9rvBX.uLhXeaMteDUia8iKTnIgt8SoPwY9MFMopOux4G5.", // password: admin123
      name: "Juan Perez",
      phone: "+51 987 654 321",
      role: "CUSTOMER",
      status: "ACTIVE",
    },
  })
  console.log(`Created customer user: ${customerUser.email}`)

  // Create Address for Customer
  await prisma.address.create({
    data: {
      label: "Casa",
      name: "Juan Perez",
      phone: "+51 987 654 321",
      address: "Av. Javier Prado 1234",
      city: "Lima",
      state: "Lima",
      zipCode: "15036",
      isDefault: true,
      userId: customerUser.id,
    },
  })
  console.log("Created address for customer")

  console.log("Seed completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
