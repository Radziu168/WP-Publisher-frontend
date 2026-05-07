import { NextResponse } from "next/server";

const WP_URL = process.env.NEXT_PUBLIC_WP_URL;
const WP_USERNAME = process.env.WP_USERNAME;
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD;

function getAuthHeader() {
  const credentials = Buffer.from(`${WP_USERNAME}:${WP_APP_PASSWORD}`).toString(
    "base64",
  );
  return `Basic ${credentials}`;
}

export async function GET() {
  const response = await fetch(
    `${WP_URL}/wp-json/wp/v2/event?status=draft&per_page=20&_embed=true`,
    {
      headers: {
        Authorization: getAuthHeader(),
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: "Błąd pobierania draftów" },
      { status: 500 },
    );
  }

  const posts = await response.json();
  return NextResponse.json(posts);
}
