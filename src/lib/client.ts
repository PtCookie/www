import { gql, GraphQLClient } from "graphql-request";

import type { AllPostsData, PostData } from "./schema";

export const getClient = () => {
  return new GraphQLClient("https://gql.hashnode.com");
};

interface PostPagination {
  first?: number;
  after?: string;
}

const hostname = import.meta.env.PUBLIC_HASHNODE_BASE_URL;

export const getAllPosts = async (pagination?: PostPagination) => {
  const client = getClient();
  const first = pagination?.first ?? 5;
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

export const getPost = async (slug: string) => {
  const client = getClient();

  const data = await client.request<PostData>(
    gql`
      query postDetails($slug: String!) {
        publication(host: "${hostname}") {
          id
          post(slug: $slug) {
            id
            author{
              name
              profilePicture
            }
            publishedAt
            title
            subtitle
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
            }
          }
        }
      }
    `,
    { slug: slug },
  );

  return data.publication.post;
};
