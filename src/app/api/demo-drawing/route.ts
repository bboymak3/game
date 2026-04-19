import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET() {
  try {
    // Try public folder first, then upload folder
    const publicPath = path.join(process.cwd(), "public", "demo-drawing.jpg");
    let filePath = publicPath;
    
    try {
      await readFile(filePath);
    } catch {
      // Fallback to upload folder
      const { readdir } = await import("fs/promises");
      const uploadDir = "/home/z/my-project/upload";
      const files = await readdir(uploadDir);
      const imageFile = files.find(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
      if (!imageFile) {
        return NextResponse.json({ error: "No hay dibujo disponible" }, { status: 404 });
      }
      filePath = path.join(uploadDir, imageFile);
    }

    const buffer = await readFile(filePath);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error serving demo drawing:", error);
    return NextResponse.json({ error: "Error al cargar el dibujo" }, { status: 500 });
  }
}
