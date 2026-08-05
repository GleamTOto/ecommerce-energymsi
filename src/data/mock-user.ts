import { products } from "./mock-products"

export interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  createdAt: string
}

export interface Address {
  id: string
  label: string
  name: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  isDefault: boolean
}

export interface OrderItem {
  productId: string
  name: string
  supplier: string
  price: number
  quantity: number
  image: string
}

export interface Order {
  id: string
  items: OrderItem[]
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  paymentMethod: string
  shippingAddress: string
  createdAt: string
  updatedAt: string
}

export const userProfile: UserProfile = {
  id: "1",
  name: "Juan Perez",
  email: "juan.perez@email.com",
  phone: "+51 999 888 777",
  createdAt: "2024-01-15",
}

export const addresses: Address[] = [
  {
    id: "1",
    label: "Casa",
    name: "Juan Perez",
    phone: "+51 999 888 777",
    address: "Av. Principal 123, Dpto 401",
    city: "Lima",
    state: "Lima",
    zipCode: "15001",
    isDefault: true,
  },
  {
    id: "2",
    label: "Oficina",
    name: "Juan Perez",
    phone: "+51 999 888 777",
    address: "Jr. Comercio 456, Piso 3",
    city: "Miraflores",
    state: "Lima",
    zipCode: "15074",
    isDefault: false,
  },
]

export const orders: Order[] = [
  {
    id: "ORD-2024-001",
    items: [
      {
        productId: products[0]?.id || "1",
        name: products[0]?.name || "Bateria Netion 12v 1.2ah",
        supplier: products[0]?.supplier || "Netion",
        price: products[0]?.price || 30000,
        quantity: 1,
        image: products[0]?.images?.[0] || "",
      },
    ],
    total: products[0]?.price || 30000,
    status: "delivered",
    paymentMethod: "Tarjeta •••• 3456",
    shippingAddress: "Av. Principal 123, Lima",
    createdAt: "2024-03-15",
    updatedAt: "2024-03-20",
  },
  {
    id: "ORD-2024-002",
    items: [
      {
        productId: products[1]?.id || "2",
        name: products[1]?.name || "Bateria Netion 12v 2ah",
        supplier: products[1]?.supplier || "Netion",
        price: products[1]?.price || 40000,
        quantity: 1,
        image: products[1]?.images?.[0] || "",
      },
      {
        productId: products[2]?.id || "3",
        name: products[2]?.name || "Bateria Netion 12v 2.3ah",
        supplier: products[2]?.supplier || "Netion",
        price: products[2]?.price || 45000,
        quantity: 1,
        image: products[2]?.images?.[0] || "",
      },
    ],
    total: (products[1]?.price || 40000) + (products[2]?.price || 45000),
    status: "shipped",
    paymentMethod: "Yape",
    shippingAddress: "Jr. Comercio 456, Miraflores",
    createdAt: "2024-03-18",
    updatedAt: "2024-03-19",
  },
  {
    id: "ORD-2024-003",
    items: [
      {
        productId: products[4]?.id || "5",
        name: products[4]?.name || "Bateria Netion 12v 4ah",
        supplier: products[4]?.supplier || "Netion",
        price: products[4]?.price || 40000,
        quantity: 2,
        image: products[4]?.images?.[0] || "",
      },
    ],
    total: (products[4]?.price || 40000) * 2,
    status: "processing",
    paymentMethod: "Transferencia BCP",
    shippingAddress: "Av. Principal 123, Lima",
    createdAt: "2024-03-20",
    updatedAt: "2024-03-20",
  },
  {
    id: "ORD-2024-004",
    items: [
      {
        productId: products[5]?.id || "6",
        name: products[5]?.name || "Bateria Netion 12v 5ah",
        supplier: products[5]?.supplier || "Netion",
        price: products[5]?.price || 45000,
        quantity: 1,
        image: products[5]?.images?.[0] || "",
      },
    ],
    total: products[5]?.price || 45000,
    status: "cancelled",
    paymentMethod: "Tarjeta •••• 7890",
    shippingAddress: "Av. Principal 123, Lima",
    createdAt: "2024-03-10",
    updatedAt: "2024-03-11",
  },
]

export const favorites = [products[0], products[1], products[6], products[9]].filter(Boolean)
