import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { replays } from "@/data/replays";

export default function sitemap(): MetadataRoute.Sitemap {
  const productPages = products.map((p) => ({
    url: `https://bilbroswagginz.com/products/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const replayPages = replays.map((r) => ({
    url: `https://bilbroswagginz.com/replays/${r.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: "https://bilbroswagginz.com",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...productPages,
    {
      url: "https://bilbroswagginz.com/replays",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...replayPages,
    {
      url: "https://bilbroswagginz.com/games",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://bilbroswagginz.com/games/udderly-abduction",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://bilbroswagginz.com/games/prompts",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
}
