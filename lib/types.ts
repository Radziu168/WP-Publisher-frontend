export interface EventDate {
  eventDate: string | null;
}

export interface PageBanner {
  pageBannerSubtitle: string | null;
  pageBannerBackgroundImage: {
    node: {
      sourceUrl: string;
      altText: string;
    };
  } | null;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  date: string;
  status: string;
  excerpt: string;
  eventDate: EventDate | null;
  pageBanner: PageBanner | null;
}

export interface EventDetail extends Event {
  content: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  count?: number;
}

export interface FeaturedImage {
  node: {
    sourceUrl: string;
    altText: string;
  };
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  categories: {
    nodes: Category[];
  };
  featuredImage: FeaturedImage | null;
}

export interface PostDetail extends Post {
  content: string;
}
