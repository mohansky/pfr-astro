// @ts-check
import { defineConfig, envField } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";
import netlify from "@astrojs/netlify";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import partytown from "@astrojs/partytown";
// https://astro.build/config
export default defineConfig({
  site: "https://pawsforrivers.com",
  output: "server",
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [mdx(), icon(), react(), sitemap(), partytown()],
  env: {
    schema: {
      RESEND_API_KEY: envField.string({
        context: "server",
        access: "secret",
        startsWith: "re_",
        optional: false,
      }),
      TURSO_DATABASE_URL: envField.string({
        context: "server",
        access: "secret",
        optional: false,
      }),
      TURSO_AUTH_TOKEN: envField.string({
        context: "server",
        access: "secret",
        optional: false,
      }),
      ADMIN_USERNAME: envField.string({
        context: "server",
        access: "secret",
        optional: false,
      }),
      ADMIN_PASSWORD: envField.string({
        context: "server",
        access: "secret",
        optional: false,
      }),
    },
  },
  adapter: netlify(),
});
