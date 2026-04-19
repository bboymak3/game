import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { readFile } from "fs/promises";
import path from "path";

export async function GET() {
  try {
    // Read the child's drawing from upload folder
    const uploadDir = "/home/z/my-project/upload";
    const { readdir } = await import("fs/promises");
    const files = await readdir(uploadDir);
    const imageFile = files.find(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));

    if (!imageFile) {
      return NextResponse.json({ error: "No hay dibujo disponible" }, { status: 404 });
    }

    const filePath = path.join(uploadDir, imageFile);
    const buffer = await readFile(filePath);
    const base64 = buffer.toString("base64");
    const ext = imageFile.toLowerCase();
    let mimeType = "image/jpeg";
    if (ext.endsWith(".png")) mimeType = "image/png";
    else if (ext.endsWith(".webp")) mimeType = "image/webp";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // Analyze with VLM using createVision
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.createVision({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: dataUrl }
            },
            {
              type: "text",
              text: `Analiza este dibujo de un niño y conviértelo en un personaje de videojuego épico. El dibujo es el personaje principal que peleará contra monstruos.

Responde SIEMPRE en este formato JSON exacto, sin texto adicional antes ni después:
{
  "characterName": "nombre creativo del personaje basado en el dibujo",
  "characterType": "guerrero|mago|tanque|asesino|support",
  "description": "descripción breve y divertida del personaje en español",
  "power": "nombre de su poder especial en español",
  "color1": "color hexadecimal principal que representaría al personaje",
  "color2": "color hexadecimal secundario",
  "stats": {
    "attack": numero del 5 al 15,
    "defense": numero del 3 al 12,
    "speed": numero del 5 al 15,
    "hp": numero del 80 al 150
  },
  "element": "fuego|hielo|rayo|tierra|oscuridad|luz|naturaleza"
}

Elige stats y poderes acordes a lo que dibujó el niño. Sé creativo con el nombre.`
            }
          ]
        }
      ],
      thinking: { type: "disabled" }
    });

    const content = completion.choices[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "No se pudo analizar", raw: content }, { status: 500 });
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      success: true,
      analysis,
      imageData: dataUrl,
    });
  } catch (error) {
    console.error("Error in demo analysis:", error);
    return NextResponse.json({ error: "Error al analizar el dibujo" }, { status: 500 });
  }
}
