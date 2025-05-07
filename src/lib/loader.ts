import type { Loader, LoaderContext } from "astro/loaders";

import { getPublication } from "@/lib/client.ts";
import { config } from "@/config.ts";

export function HashnodeLoader(): Loader {
  return {
    name: "hashnode-loader",
    load: async ({ store, logger, parseData }: LoaderContext): Promise<void> => {
      logger.info(`Loading posts of from Hashnode`);
      store.clear();

      for (const locale of config.locales) {
        const data = await getPublication({ locale });

        for (const item of data.publication.posts.edges) {
          const parsedData = await parseData({ id: item.node.id, data: { ...item.node, locale } });

          store.set({
            id: parsedData.id,
            data: parsedData,
          });
        }
      }

      logger.info(`Finished loading ${store.entries().length} posts of from Hashnode`);
    },
  };
}
