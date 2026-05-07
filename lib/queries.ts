export const GET_EVENTS = `
{
  events(first: 10) {
    nodes {
      id
      title
      slug
      date
      status
      excerpt
      eventDate {
        eventDate
      }
      pageBanner {
        pageBannerSubtitle
        pageBannerBackgroundImage {
          node {
            sourceUrl
            altText
          }
        }
      }
    }
  }
}
`;

export const GET_EVENT_BY_SLUG = `
query GetEvent($slug: String!) {
  eventBy(slug: $slug) {
    id
    title
    content
    date
    excerpt
    eventDate {
      eventDate
    }
    pageBanner {
      pageBannerSubtitle
      pageBannerBackgroundImage {
        node {
          sourceUrl
          altText
        }
      }
    }
  }
}
`;

export const GET_POSTS = `
{
  posts(first: 10, where: { status: PUBLISH }) {
    nodes {
      id
      title
      slug
      date
      excerpt
      categories {
        nodes {
          name
          slug
        }
      }
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
    }
  }
}
`;

export const GET_POST_BY_SLUG = `
query GetPost($slug: String!) {
  postBy(slug: $slug) {
    id
    title
    content
    date
    excerpt
    categories {
      nodes {
        name
        slug
      }
    }
    featuredImage {
      node {
        sourceUrl
        altText
      }
    }
  }
}
`;

export const GET_CATEGORIES = `
{
  categories(first: 20) {
    nodes {
      id
      name
      slug
      count
    }
  }
}
`;
