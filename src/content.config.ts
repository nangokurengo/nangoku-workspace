import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const photosCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/photos' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    image: image(), // Validates and processes the image path
    date: z.coerce.date(),
    location: z.string(),
    exif: z.object({
      camera: z.string(),
      lens: z.string(),
      shutter: z.string(),
      aperture: z.string(),
      iso: z.number(),
      focalLength: z.string(),
    }),
    description: z.string().optional(),
  }),
});

const blogCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    category: z.enum(['gadget', 'server', 'review', 'custom', 'technology', 'photography']),
    description: z.string(),
    coverImage: image().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = {
  photos: photosCollection,
  blog: blogCollection,
};
