import { defineCollection, z } from "astro:content";
import { file, glob } from "astro/loaders";

const siteCollection = defineCollection({
  loader: file("src/content/site/index.yml"),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      title: z.string(),
      description: z.string(),
      basepath: z.string().url({ message: "Base path must be a valid URL" }),
      ogImageURL: image(),
      keywords: z.array(z.string()),
      author: z.object({
        name: z.string(),
        email: z.string().email({ message: "Must be a valid email address" }),
        url: z.string().url({ message: "URL must be valid" }),
      }),
      footnote1: z.string(),
      footnote: z.string(),
      copyright: z.string(),
      email: z.string().email({ message: "Must be a valid email address" }),
      hero: z.array(
        z.object({
          bgImage: image(),
          title: z.string(),
          subtitle: z.string(),
          btnText: z.string(),
          btnLink: z.string(),
        })
      ),
      links: z.array(
        z.object({
          text: z.string(),
          link: z.string(),
        })
      ),
      introTitle: z.string(),
      introSubtitle: z.string(),
      intro: z.array(z.string()),
      aboutTitle: z.string(), 
      treatsTitle: z.string(),
      treatsSubtitle: z.string(),
      treats: z.array(
        z.object({
          idx: z.number(),
          name: z.string(),
          origin: z.string(),
          image: image(),
        })
      ),
      problemTitle: z.string(),
      problem: z.array(
        z.object({
          idx: z.number(),
          text: z.string(),
          icon: z.string(),
        })
      ),
      missionTitle: z.string(),
      missions: z.array(
        z.object({
          idx: z.number(),
          text: z.string(),
          icon: z.string(),
        })
      ),
      revolutionizing: z.array(z.string()),
      whyTitle: z.string(),
      whyText: z.array(
        z.object({
          title: z.string(),
          text: z.string(),
        })
      ),
      goalsTitle: z.string(),
      goalsSubtitle: z.string(),
      goals: z.array(
        z.object({
          idx: z.number(),
          icon: z.string(),
          title: z.string(),
        })
      ),
      galleryTitle: z.string(),
      teamTitle: z.string(),
      teamSubtitle: z.string(),
      team: z.array(
        z.object({
          idx: z.number(),
          name: z.string(),
          description: z.string(),
          role: z.string(),
          image: image(),
        })
      ),
      fish: z.array(
        z.object({
          idx: z.number(),
          origin: z.string(),
          name: z.string(),
          image: image(),
        })
      ),
      contactTitle: z.string(),
      contactSubtitle: z.string(),
      contact: z.array(
        z.object({
          link: z.string(),
          icon: z.string(),
          text: z.string(),
        })
      ),
      socialsTitle: z.string(),
      socials: z.array(
        z.object({
          link: z.string(),
          icon: z.string(),
          text: z.string(),
        })
      ),
    }),
});

const treatsCollection = defineCollection({
  loader: glob({ pattern: ["*.mdx"], base: "src/content/treats" }),
  schema: ({ image }) =>
    z.object({
      published: z.boolean().optional().default(true),
      id: z.number(),
      comingSoon: z.boolean().optional().default(false),
      name: z.string().optional(),
      description: z.string().optional(),
      price: z.string().optional(),
      weight: z.string().optional(),
      origin: z.string().optional(),
      source: z.string().optional(),
      for: z.string().optional(),
      image: image(),
    }),
});

export const collections = {
  siteCollection: siteCollection,
  treatsCollection: treatsCollection,
};
