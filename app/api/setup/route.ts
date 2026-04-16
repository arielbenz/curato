import { createTable } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await createTable();
    return NextResponse.json({ 
      success: true, 
      message: "✅ Tablas creadas exitosamente!" 
    });
  } catch (error) {
    console.error("Error al crear las tablas:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Error desconocido" 
    }, { status: 500 });
  }
}
