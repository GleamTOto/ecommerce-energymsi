import { randomUUID } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import {
  deleteFile,
  getPublicUrl,
  assertSafeObjectKey,
  R2ConfigurationError,
  R2ObjectVerificationError,
  uploadFile,
  verifyObject,
} from "@/lib/r2"
import { isAdmin } from "@/lib/auth"

const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const maxSize = 5 * 1024 * 1024
function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) return unauthorizedResponse()

  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file was provided" }, { status: 400 })
    }

    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed" },
        { status: 400 }
      )
    }

    if (file.size > maxSize) {
      return NextResponse.json({ error: "File is too large. Maximum size is 5 MB" }, { status: 400 })
    }

    const extension = file.type.split("/")[1].replace("jpeg", "jpg")
    const key = `products/${randomUUID()}.${extension}`
    const body = Buffer.from(await file.arrayBuffer())
    await uploadFile(body, file.type, key)
    await verifyObject(key, { contentType: file.type, size: body.length })

    return NextResponse.json({ url: getPublicUrl(key), publicId: key })
  } catch (error) {
    console.error("Error uploading image:", error)
    const status = error instanceof R2ConfigurationError ? 503 : error instanceof R2ObjectVerificationError ? 502 : 500
    return NextResponse.json(
      {
        error:
          status === 503
            ? "Image service is not configured"
            : status === 502
              ? "Uploaded image could not be verified"
              : "Error uploading image",
      },
      { status }
    )
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdmin())) return unauthorizedResponse()

  const publicId = new URL(request.url).searchParams.get("publicId")
  if (!publicId) {
    return NextResponse.json({ error: "publicId is required" }, { status: 400 })
  }

  // Legacy Cloudinary/local IDs are preserved and are never sent to R2.
  try {
    assertSafeObjectKey(publicId)
  } catch {
    return NextResponse.json({ success: true, skipped: true })
  }

  try {
    await deleteFile(publicId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting image:", error)
    const status = error instanceof R2ConfigurationError ? 503 : 500
    return NextResponse.json(
      { error: status === 503 ? "Image service is not configured" : "Error deleting image" },
      { status }
    )
  }
}
