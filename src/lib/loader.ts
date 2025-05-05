import type { Loader, LoaderContext } from "astro/loaders";

import { getAllPosts } from "@/lib/client.ts";

interface HashnodeLoaderOptions {
  hostname: string;
}

export function HashnodeLoader(options: HashnodeLoaderOptions): Loader {
  return {
    name: "hashnode-loader",
    load: async ({ store, logger, parseData }: LoaderContext): Promise<void> => {
      logger.info(`Loading posts of "${options.hostname}" from Hashnode`);
      store.clear();

      const data = await getAllPosts();

      for (const item of data.publication.posts.edges) {
        const parsedData = await parseData({ id: item.node.id, data: item.node });

        store.set({
          id: parsedData.id,
          data: parsedData,
        });
      }

      logger.info(`Finished loading ${store.entries().length} posts of "${options.hostname}" from Hashnode`);
    },
  };
}
