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
  phone: "+57 999 888 777",
  createdAt: "2024-01-15",
}

export const addresses: Address[] = [
  {
    id: "1",
    label: "Casa",
    name: "Juan Perez",
    phone: "+57 999 888 777",
    address: "Av. Principal 123, Dpto 401",
    city: "Bogotá",
    state: "Bogotá",
    zipCode: "15001",
    isDefault: true,
  },
  {
    id: "2",
    label: "Oficina",
    name: "Juan Perez",
    phone: "+57 999 888 777",
    address: "Jr. Comercio 456, Piso 3",
    city: "Bogotá",
    state: "Bogotá",
    zipCode: "15074",
    isDefault: false,
  },
]

export const orders: Order[] = [
  {
    id: "ORD-2024-001",
    items: [
      {
        productId: "1",
        name: "Bateria Netion 12v 1.2ah",
        supplier: "Netion",
        price: 30000,
        quantity: 1,
        image: "",
      },
    ],
    total: 30000,
    status: "delivered",
    paymentMethod: "Tarjeta •••• 3456",
    shippingAddress: "Av. Principal 123, Bogotá",
    createdAt: "2024-03-15",
    updatedAt: "2024-03-20",
  },
  {
    id: "ORD-2024-002",
    items: [
      {
        productId: "2",
        name: "Bateria Netion 12v 2ah",
        supplier: "Netion",
        price: 40000,
        quantity: 1,
        image: "",
      },
      {
        productId: "3",
        name: "Bateria Netion 12v 2.3ah",
        supplier: "Netion",
        price: 45000,
        quantity: 1,
        image: "",
      },
    ],
    total: 85000,
    status: "shipped",
    paymentMethod: "Yape",
    shippingAddress: "Jr. Comercio 456, Bogotá",
    createdAt: "2024-03-18",
    updatedAt: "2024-03-19",
  },
  {
    id: "ORD-2024-003",
    items: [
      {
        productId: "5",
        name: "Bateria Netion 12v 4ah",
        supplier: "Netion",
        price: 40000,
        quantity: 2,
        image: "",
      },
    ],
    total: 80000,
    status: "processing",
    paymentMethod: "Transferencia BCP",
    shippingAddress: "Av. Principal 123, Bogotá",
    createdAt: "2024-03-20",
    updatedAt: "2024-03-20",
  },
  {
    id: "ORD-2024-004",
    items: [
      {
        productId: "6",
        name: "Bateria Netion 12v 5ah",
        supplier: "Netion",
        price: 45000,
        quantity: 1,
        image: "",
      },
    ],
    total: 45000,
    status: "cancelled",
    paymentMethod: "Tarjeta •••• 7890",
    shippingAddress: "Av. Principal 123, Bogotá",
    createdAt: "2024-03-10",
    updatedAt: "2024-03-11",
  },
]

export const favorites: string[] = []
