// src/pages/api/update-order.ts
import { getSecret } from "astro:env/server";
import { createClient } from "@libsql/client";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    // Check authentication
    const cookies = request.headers.get("cookie");
    if (!cookies || !cookies.includes("admin-auth=true")) {
      return redirect("/admin-login?error=auth");
    }

    // Get form data
    const formData = await request.formData();
    const orderId = formData.get("orderId")?.toString();
    const fullName = formData.get("fullName")?.toString();
    const email = formData.get("email")?.toString();
    const phone = formData.get("phone")?.toString();
    const address = formData.get("address")?.toString();
    const wetFood250 = Number(formData.get("wetFood250")?.toString() || "0");
    const wetFood100 = Number(formData.get("wetFood100")?.toString() || "0");
    const treats150 = Number(formData.get("treats150")?.toString() || "0");
    const status = formData.get("status")?.toString();

    // Validate required fields
    if (!orderId || !fullName || !email || !phone || !address || wetFood250 === null || wetFood100 === null || treats150 === null || !status) {
      return redirect("/orders?error=Missing required fields");
    }

    // Valid status values
    const validStatuses = [
      "pending",
      "processing", 
      "shipped", 
      "delivered", 
      "cancelled", 
      "refunded"
    ];

    if (!validStatuses.includes(status.toString())) {
      return redirect("/orders?error=Invalid status value");
    }

    // Connect to database
    const dbUrl = getSecret("TURSO_DATABASE_URL");
    const authToken = getSecret("TURSO_AUTH_TOKEN");

    if (!dbUrl || !authToken) {
      throw new Error("Missing Turso database credentials");
    }

    const db = createClient({
      url: dbUrl,
      authToken: authToken,
    });

    // Update the order
    await db.execute(
      "UPDATE orders SET full_name = ?, email = ?, phone = ?, address = ?, wet_food_250_qty = ?, wet_food_100_qty = ?, treats_150_qty = ?, status = ? WHERE id = ?",
      [
        fullName,
        email,
        phone,
        address,
        wetFood250,
        wetFood100,
        treats150,
        status,
        orderId,
      ]
    );

    return redirect(`/orders?success=Order updated successfully`);
  } catch (error) {
    console.error("Failed to update order:", error);
    return redirect("/orders?error=Failed to update order");
  }
};