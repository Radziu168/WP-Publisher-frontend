import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (secret !== REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tag } = await request.json();

  if (!tag) {
    return NextResponse.json(
      { error: "Brakuje parametru tag" },
      { status: 400 },
    );
  }

  revalidateTag(tag);
  return NextResponse.json({ revalidated: true, tag });
}
