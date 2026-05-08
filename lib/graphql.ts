const GRAPHQL_URL = process.env.WORDPRESS_GRAPHQL_URL!;

export async function fetchGraphQL(
  query: string,
  variables: Record<string, unknown> = {},
  options: { revalidate?: number; tags?: string[] } = {},
) {
  const { revalidate = 60, tags = [] } = options;

  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate, tags },
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status}`);
  }

  const data = await response.json();

  if (data.errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(data.errors)}`);
  }

  const wpUrl = process.env.NEXT_PUBLIC_WP_URL || "";
  const jsonString = JSON.stringify(data.data).replace(
    /http:\/\/localhost\/project/g,
    wpUrl,
  );

  return JSON.parse(jsonString);
}
