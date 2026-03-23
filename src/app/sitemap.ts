import type { MetadataRoute } from "next";
import { products } from "@/data/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const productPages = products.map((p) => ({
    url: `https://bilbroswagginz.com/products/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
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
