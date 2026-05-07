import { fetchGraphQL } from "@/lib/graphql";
import { GET_EVENTS } from "@/lib/queries";
import { Event } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";

export default async function EventsPage() {
  const data = await fetchGraphQL(
    GET_EVENTS,
    {},
    {
      revalidate: 300,
      tags: ["events"],
    },
  );
  const events: Event[] = data.events.nodes;

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Wydarzenia</h1>
      <div className="grid gap-6">
        {events.map((event) => {
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
            <Link
              key={event.id}
              href={`/events/${event.slug}`}
              className="block border border-gray-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-md transition-all"
            >
              {image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image.sourceUrl}
                  alt={image.altText || event.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <div className="text-sm text-blue-600 font-medium mb-1">
                {eventDate}
              </div>
              <h2 className="text-xl font-bold mb-2">{event.title}</h2>
              {subtitle && (
                <p className="text-gray-500 text-sm mb-3">{subtitle}</p>
              )}
              <div
                className="text-gray-600 text-sm line-clamp-2"
                dangerouslySetInnerHTML={{ __html: event.excerpt }}
              />
            </Link>
          );
        })}
      </div>
    </main>
  );
}
