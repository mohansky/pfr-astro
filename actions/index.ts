import type { APIRoute } from "astro";
import { Resend } from "resend";
import { getSecret } from "astro:env/server";
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { render } from "@react-email/components";
import SampleEmail from "@/emails/preorder";
import { createClient } from '@libsql/client';


interface OrderData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  "quantity-wet-food-250"?: number;
  "quantity-wet-food-100"?: number;
  "quantity-treats-150"?: number;
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
  authToken: authToken
});

export const server = {
  contactForm: defineAction({
    accept: "form",
    input: z.object({
      products: z.array(z.string()).optional(),
      "quantity-wet-food-250": z.coerce.number().min(0).max(10).optional(),
      "quantity-wet-food-100": z.coerce.number().min(0).max(10).optional(),
      "quantity-treats-150": z.coerce.number().min(0).max(10).optional(),
      fullName: z.string().min(3, { message: "Name is required" }),
      email: z.string().email({ message: "Email is required" }),
      phone: z
        .string()
        .min(10, {
          message:
            "Phone number is required and need to be at least 10 digits.",
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
      if (
        formData["quantity-wet-food-250"] &&
        formData["quantity-wet-food-250"] > 0
      ) {
        selectedProducts.push({
          name: "Wet food 250grams",
          quantity: formData["quantity-wet-food-250"],
        });
      }
      
      if (
        formData["quantity-wet-food-100"] &&
        formData["quantity-wet-food-100"] > 0
      ) {
        selectedProducts.push({
          name: "Wet food 100grams",
          quantity: formData["quantity-wet-food-100"],
        });
      }
      
      if (
        formData["quantity-treats-150"] &&
        formData["quantity-treats-150"] > 0
      ) {
        selectedProducts.push({
          name: "Treats 150grams",
          quantity: formData["quantity-treats-150"],
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
                  wet_food_250_qty, 
                  wet_food_100_qty, 
                  treats_150_qty,
                  created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            formData.fullName,
            formData.email,
            formData.phone,
            formData.address,
            formData["quantity-wet-food-250"] || 0,
            formData["quantity-wet-food-100"] || 0,
            formData["quantity-treats-150"] || 0,
            new Date().toISOString()
          ]
        });
        
        const orderId = result.lastInsertRowid;
        console.log(`Order saved with ID: ${orderId}`);
        
        // Create enriched data object for email template
        const emailData = {
          ...formData,
          selectedProducts,
          orderId
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
            // "pawsforrivers@gmail.com",
            // "neetimahesh@gmail.com",
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
          success: true
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