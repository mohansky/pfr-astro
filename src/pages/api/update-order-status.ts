// src/pages/api/update-order-status.ts
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
    const status = formData.get("status")?.toString();

    // Validate inputs
    if (!orderId || !status) {
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

    // Update the order status
    await db.execute(
      "UPDATE orders SET status = ? WHERE id = ?",
      [status, orderId]
    );

    return redirect(`/orders?success=Order status updated successfully`);
  } catch (error) {
    console.error("Failed to update order status:", error);
    return redirect("/orders?error=Failed to update order status");
  }
};