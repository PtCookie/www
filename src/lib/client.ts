import { gql, GraphQLClient } from "graphql-request";

import type { Publication } from "@/lib/schema.ts";

interface PostPagination {
  locale?: string;
  first?: number;
}

const hostname = import.meta.env.PUBLIC_HASHNODE_BASE_URL;

const getClient = () => {
  return new GraphQLClient("https://gql.hashnode.com");
};

export const getPublication = async ({ locale, first = 20 }: PostPagination) => {
  const client = getClient();

  return await client.request<Publication>(
    gql`
      query allPosts($host: String, $first: Int!) {
        publication(host: $host) {
          id
          title
          posts(first: $first) {
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              cursor
              node {
                id
                author {
                  name
                  profilePicture
                }
                publishedAt
                title
                subtitle
                brief
                slug
                readTimeInMinutes
                content {
                  markdown
                }
                tags {
                  name
                  slug
                }
                coverImage {
                  url
                  attribution
                  photographer
                }
              }
            }
          }
        }
      }
    `,
    {
      host: [hostname, locale].filter(Boolean).join("/"),
      first,
    },
  );
};
