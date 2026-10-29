import { createRequire } from "node:module"

type CloudinaryClient = {
  config: (options: {
    cloud_name: string
    api_key: string
    api_secret: string
  }) => void
}

const require = createRequire(import.meta.url)
const cloudinary = (() => {
  try {
    return require("cloudinary").v2 as CloudinaryClient
  } catch {
    return { config: () => undefined } satisfies CloudinaryClient
  }
})()

// Configurar Cloudinary solo si las credenciales están disponibles
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

export { cloudinary }
