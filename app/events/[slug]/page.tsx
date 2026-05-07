import { fetchGraphQL } from "@/lib/graphql";
import { GET_EVENT_BY_SLUG } from "@/lib/queries";
import { EventDetail } from "@/lib/types";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const data = await fetchGraphQL(
    GET_EVENT_BY_SLUG,
    { slug },
    {
      revalidate: 300,
      tags: ["events", `event-${slug}`],
    },
  );
  const event: EventDetail | null = data.eventBy;

  if (!event) return {};

  const image = event.pageBanner?.pageBannerBackgroundImage?.node;
  const subtitle = event.pageBanner?.pageBannerSubtitle ?? "";

  return {
    title: event.title,
    description:
      subtitle || event.excerpt.replace(/<[^>]*>/g, "").slice(0, 155),
    openGraph: {
      title: event.title,
      description: subtitle,
      images: image ? [{ url: image.sourceUrl }] : [],
    },
  };
}

export async function generateStaticParams() {
  const data = await fetchGraphQL(`
    {
      events(first: 100) {
        nodes {
          slug
        }
      }
    }
  `);

  return data.events.nodes.map((event: { slug: string }) => ({
    slug: event.slug,
  }));
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const data = await fetchGraphQL(GET_EVENT_BY_SLUG, { slug });
  const event: EventDetail | null = data.eventBy;

  if (!event) {
    notFound();
  }

  const eventDate = event.eventDate?.eventDate
    ? new Date(event.eventDate.eventDate).toLocaleDateString("pl-PL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Brak daty";

  const subtitle = event.pageBanner?.pageBannerSubtitle;
  const image = event.pageBanner?.pageBannerBackgroundImage?.node;

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <Link
        href="/events"
        className="text-blue-600 text-sm hover:underline mb-8 inline-block"
      >
        ← Powrót do wydarzeń
      </Link>

      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image.sourceUrl}
          alt={image.altText || event.title}
          className="w-full h-64 object-cover rounded-xl mb-8"
        />
      )}

      <div className="text-sm text-blue-600 font-medium mb-2">{eventDate}</div>
      <h1 className="text-4xl font-bold mb-3">{event.title}</h1>

      {subtitle && (
        <p className="text-gray-500 text-lg mb-8 border-l-4 border-blue-400 pl-4">
          {subtitle}
        </p>
      )}

      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: event.content }}
      />
    </main>
  );
}
