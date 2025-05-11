import type { APIRoute } from "astro";
import { Resend } from "resend";
import { getSecret } from "astro:env/server";
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { render } from "@react-email/components";
import SampleEmail from "@/emails/preorder";
import { createClient } from "@libsql/client";

interface OrderData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  "ymy-cookies-cats"?: number;
  "ymy-cookies-dogs"?: number;
  "tilapia-feast"?: number;
  "cat-and-mousse"?: number;
  "freeze-dried-fish"?: number;
  a_password?: string;
  products?: string[];
}

interface SelectedProduct {
  name: string;
  quantity: number;
}

const resend = new Resend(getSecret("RESEND_API_KEY"));

const dbUrl = getSecret("TURSO_DATABASE_URL");
const authToken = getSecret("TURSO_AUTH_TOKEN");

console.log("DB URL:", dbUrl);
console.log("Auth token available:", !!authToken);
console.log("Auth token length:", authToken?.length);

if (!dbUrl || !authToken) {
  throw new Error("Missing Turso database credentials");
}

const db = createClient({
  url: dbUrl,
  authToken: authToken,
});

export const server = {
  contactForm: defineAction({
    accept: "form",
    input: z.object({
      products: z.array(z.string()).optional(),
      "ymy-cookies-cats": z.coerce.number().min(0).max(10).optional(),
      "ymy-cookies-dogs": z.coerce.number().min(0).max(10).optional(),
      "tilapia-feast": z.coerce.number().min(0).max(10).optional(),
      "cat-and-mousse": z.coerce.number().min(0).max(10).optional(),
      "freeze-dried-fish": z.coerce.number().min(0).max(10).optional(),
      fullName: z.string().min(3, { message: "Name is required" }),
      email: z.string().email({ message: "Email is required" }),
      phone: z.string().min(10, {
        message: "Phone number is required and need to be at least 10 digits.",
      }),
      address: z.string().min(5, { message: "Address is required" }),
      // Honeypot field - not a real input
      a_password: z.string().optional(),
    }),
    handler: async (formData: OrderData) => {
      // Check honeypot for spam prevention
      if (formData.a_password && formData.a_password.trim() !== "") {
        throw new ActionError({
          message: "Spam detected",
          code: "BAD_REQUEST",
        });
      }

      // Format the products data for the email
      const selectedProducts: SelectedProduct[] = [];

      // Check each product and add if quantity > 0

      if (formData["ymy-cookies-cats"] && formData["ymy-cookies-cats"] > 0) {
        selectedProducts.push({
          name: "Yummy in my tummy - Cookies",
          quantity: formData["ymy-cookies-cats"],
        });
      }

      if (formData["ymy-cookies-dogs"] && formData["ymy-cookies-dogs"] > 0) {
        selectedProducts.push({
          name: "Yummy in my tummy - Cookies",
          quantity: formData["ymy-cookies-dogs"],
        });
      }

      if (formData["tilapia-feast"] && formData["tilapia-feast"] > 0) {
        selectedProducts.push({
          name: "Tilapia Feast",
          quantity: formData["tilapia-feast"],
        });
      }

      if (formData["cat-and-mousse"] && formData["cat-and-mousse"] > 0) {
        selectedProducts.push({
          name: "Cat and Mousse",
          quantity: formData["cat-and-mousse"],
        });
      }

      if (formData["freeze-dried-fish"] && formData["freeze-dried-fish"] > 0) {
        selectedProducts.push({
          name: "Freeze dried fish",
          quantity: formData["freeze-dried-fish"],
        });
      }

      // Check if at least one product is selected
      if (selectedProducts.length === 0) {
        throw new ActionError({
          message: "Please select at least one product",
          code: "BAD_REQUEST",
        });
      }

      try {
        // Save the order to the database
        const result = await db.execute({
          sql: `INSERT INTO orders (
                  full_name, 
                  email, 
                  phone, 
                  address,
                  ymy_cookies_cats_qty,
                  ymy_cookies_dogs_qty,
                  tilapia_feast_qty,
                  cat_and_mousse_qty,
                  freeze_dried_fish_qty,
                  created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            formData.fullName,
            formData.email,
            formData.phone,
            formData.address,
            formData["ymy-cookies-cats"] || 0,
            formData["ymy-cookies-dogs"] || 0,
            formData["tilapia-feast"] || 0,
            formData["cat-and-mousse"] || 0,
            formData["freeze-dried-fish"] || 0,
            new Date().toISOString(),
          ],
        });

        const orderId = result.lastInsertRowid;
        console.log(`Order saved with ID: ${orderId}`);

        // Create enriched data object for email template
        const emailData = {
          ...formData,
          selectedProducts,
          orderId,
        };

        // Create the email
        const emailContent = SampleEmail(emailData);
        const html = await render(emailContent);
        const text = await render(emailContent, {
          plainText: true,
        });

        // Send an email
        const { data, error } = await resend.emails.send({
          from: "Paws for rivers <mail@mohankumar.dev>",
          to: [
            "mohansky@gmail.com",
            "pawsforrivers@gmail.com",
            "neetimahesh@gmail.com",
            // `${formData.email}`,
          ],
          subject: `Preorder from ${formData.fullName}`,
          html,
          text,
        });

        if (error) {
          throw error;
        }

        return {
          ...data,
          orderId,
          success: true,
        };
      } catch (dbError) {
        console.error("Database error:", dbError);
        throw new ActionError({
          message: "Failed to save your order. Please try again.",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  }),
};
