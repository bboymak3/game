import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("drawing") as File | null;

    if (!imageFile) {
      return NextResponse.json({ error: "No se proporcionó imagen" }, { status: 400 });
    }

    const bytes = await imageFile.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = imageFile.type || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Eres un analizador de dibujos de niños para un videojuego AR. 
Analiza el dibujo y responde SIEMPRE en este formato JSON exacto, sin texto adicional:
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
}`
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: dataUrl }
            },
            {
              type: "text",
              text: "Analiza este dibujo de un niño y conviértelo en un personaje de videojuego épico. El dibujo es el personaje principal que peleará contra monstruos."
            }
          ]
        }
      ],
    });

    const content = completion.choices[0]?.message?.content || "";
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "No se pudo analizar el dibujo" }, { status: 500 });
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      success: true,
      analysis,
      imageData: dataUrl,
    });

  } catch (error) {
    console.error("Error analyzing drawing:", error);
    return NextResponse.json({ error: "Error al analizar el dibujo" }, { status: 500 });
  }
}
