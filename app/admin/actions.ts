"use server";

import { revalidatePath } from "next/cache";

const WP_URL = process.env.NEXT_PUBLIC_WP_URL;
const WP_USERNAME = process.env.WP_USERNAME;
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD;

function getAuthHeader() {
  const credentials = Buffer.from(`${WP_USERNAME}:${WP_APP_PASSWORD}`).toString(
    "base64",
  );
  return `Basic ${credentials}`;
}

export async function approvePost(postId: number) {
  const response = await fetch(`${WP_URL}/wp-json/wp/v2/event/${postId}`, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: "publish" }),
  });

  if (!response.ok) {
    throw new Error(`Błąd publikacji: ${response.status}`);
  }

  revalidatePath("/admin");
  revalidatePath("/events");
  revalidateTag("events"); // ← dodaj
  return { success: true };
}

export async function rejectPost(postId: number) {
  const response = await fetch(`${WP_URL}/wp-json/wp/v2/event/${postId}`, {
    method: "DELETE",
    headers: {
      Authorization: getAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error(`Błąd usuwania: ${response.status}`);
  }

  revalidatePath("/admin");
  return { success: true };
}
