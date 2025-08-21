import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");
  if (!username) {
    return NextResponse.json(
      { error: "username is required" },
      { status: 400 },
    );
  }
  const res = await fetch(
    `https://api.sigle.io/api/gaia/${username}/stories/${id}`,
  );
  const data = await res.json();
  return NextResponse.json(data);
}
