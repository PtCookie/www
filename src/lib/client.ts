import { gql, GraphQLClient } from "graphql-request";

import type { AllPostsData } from "./schema.ts";

interface PostPagination {
  first?: number;
  after?: string;
}

const hostname = import.meta.env.PUBLIC_HASHNODE_BASE_URL;

const getClient = () => {
  return new GraphQLClient("https://gql.hashnode.com");
};

export const getAllPosts = async (pagination?: PostPagination) => {
  const client = getClient();
  const first = pagination?.first ?? 20;
  const after = pagination?.after ?? "";

  return await client.request<AllPostsData>(
    gql`
      query allPosts($first: Int!, $after: String) {
        publication(host: "${hostname}") {
          id
          title
          posts(first: $first, after: $after) {
            pageInfo{
              hasNextPage
              endCursor
            }
            edges {
              cursor
              node {
                id
                author{
                  name
                  profilePicture
                }
                publishedAt
                title
                subtitle
                brief
                slug
                readTimeInMinutes
                content{
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
    { first, after },
  );
};
