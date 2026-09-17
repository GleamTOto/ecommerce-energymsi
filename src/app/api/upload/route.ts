import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import { cloudinary } from "@/lib/cloudinary"

// Detectar si estamos en producción (Vercel u otros entornos serverless)
const isProduction = process.env.NODE_ENV === "production" || !!process.env.VERCEL

// Cloudinary es obligatorio en producción (el filesystem es de solo lectura)
const useCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
)

export async function POST(request: NextRequest) {
  try {
    // En producción, Cloudinary es obligatorio (el filesystem es de solo lectura)
    if (isProduction && !useCloudinary) {
      console.error("Cloudinary not configured in production")
      return NextResponse.json(
        { error: "Servicio de imágenes no configurado. Contacta al administrador." },
        { status: 503 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo" },
        { status: 400 }
      )
    }

    // Validar tipo de archivo
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no válido. Solo se permiten imágenes (JPG, PNG, WebP, GIF)" },
        { status: 400 }
      )
    }

    // Validar tamaño (máx 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "El archivo es demasiado grande. Máximo 5MB" },
        { status: 400 }
      )
    }

    // Si Cloudinary está configurado, usarlo
    if (useCloudinary) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const result = await new Promise<{ secure_url: string; public_id: string }>(
        (resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: "energyMSI/products",
                resource_type: "image",
                transformation: [
                  { width: 1200, height: 1200, crop: "limit" },
                  { quality: "auto" },
                  { fetch_format: "auto" },
                ],
              },
              (error, result) => {
                if (error) reject(error)
                else resolve(result as { secure_url: string; public_id: string })
              }
            )
            .end(buffer)
        }
      )

      return NextResponse.json({
        url: result.secure_url,
        publicId: result.public_id,
      })
    }

    // Fallback: Upload local para desarrollo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Crear nombre único para el archivo
    const timestamp = Date.now()
    const ext = file.name.split(".").pop() || "jpg"
    const filename = `${timestamp}.${ext}`
    
    // Crear directorio si no existe
    const uploadDir = join(process.cwd(), "public", "uploads", "products")
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }
    
    // Guardar archivo
    const filepath = join(uploadDir, filename)
    await writeFile(filepath, buffer)
    
    // URL pública
    const url = `/uploads/products/${filename}`
    const publicId = `local_${timestamp}`

    return NextResponse.json({
      url,
      publicId,
    })
  } catch (error) {
    console.error("Error uploading image:", error)
    return NextResponse.json(
      { error: "Error al subir la imagen" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // En producción, Cloudinary es obligatorio
    if (isProduction && !useCloudinary) {
      console.error("Cloudinary not configured in production")
      return NextResponse.json(
        { error: "Servicio de imágenes no configurado. Contacta al administrador." },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url)
    const publicId = searchParams.get("publicId")

    if (!publicId) {
      return NextResponse.json(
        { error: "Se requiere el publicId" },
        { status: 400 }
      )
    }

    // Si es un archivo local, eliminarlo del sistema de archivos
    if (publicId.startsWith("local_")) {
      const timestamp = publicId.replace("local_", "")
      const uploadDir = join(process.cwd(), "public", "uploads", "products")
      
      // Buscar el archivo con ese timestamp
      const { readdir, unlink } = await import("fs/promises")
      try {
        const files = await readdir(uploadDir)
        const fileToDelete = files.find(f => f.startsWith(timestamp))
        if (fileToDelete) {
          await unlink(join(uploadDir, fileToDelete))
        }
      } catch (err) {
        // Si el directorio no existe o el archivo no se encuentra, no es un error crítico
        console.log("Local file not found or already deleted:", publicId)
      }
      
      return NextResponse.json({ success: true })
    }

    // Si es Cloudinary, eliminar de ahí
    if (useCloudinary) {
      await cloudinary.uploader.destroy(publicId)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: "No se puede eliminar: Cloudinary no está configurado" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error deleting image:", error)
    return NextResponse.json(
      { error: "Error al eliminar la imagen" },
      { status: 500 }
    )
  }
}
