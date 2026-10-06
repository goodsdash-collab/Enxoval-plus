import { NextRequest, NextResponse } from "next/server";
import { getCatalog } from "@/lib/catalog";

export async function GET(req: NextRequest) {
  const tipo = req.nextUrl.searchParams.get("tipo");
  if (tipo !== "casamento" && tipo !== "bebe") {
    return NextResponse.json({ error: "tipo deve ser casamento ou bebe" }, { status: 400 });
  }
  return NextResponse.json(
    { categorias: getCatalog(tipo) },
    { headers: { "Cache-Control": "public, max-age=300, s-maxage=3600" } }
  );
}
