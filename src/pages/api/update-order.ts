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
    const ymy_cookies_cats = Number(
      formData.get("ymy_cookies_cats")?.toString() || "0"
    );
    const ymy_cookies_dogs = Number(
      formData.get("ymy_cookies_dogs")?.toString() || "0"
    );
    const tilapia_feast = Number(
      formData.get("tilapia_feast")?.toString() || "0"
    );
    const cat_and_mousse = Number(
      formData.get("cat_and_mousse")?.toString() || "0"
    );
    const freeze_dried_fish = Number(
      formData.get("freeze_dried_fish")?.toString() || "0"
    );
    const status = formData.get("status")?.toString();

    // Validate required fields - fixed the validation logic
    if (
      !orderId || 
      !fullName || 
      !email || 
      !phone || 
      !address || 
      ymy_cookies_cats === null || 
      ymy_cookies_dogs === null || 
      tilapia_feast === null || 
      cat_and_mousse === null || 
      freeze_dried_fish === null || 
      !status
    ) {
      return redirect("/orders?error=Missing required fields");
    }

    // Valid status values
    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
    ];
    
    if (!validStatuses.includes(status)) {
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

    // Update the order - fixed parameter order in the query
    await db.execute(
      "UPDATE orders SET full_name = ?, email = ?, phone = ?, address = ?, ymy_cookies_cats_qty = ?, ymy_cookies_dogs_qty = ?, tilapia_feast_qty = ?, cat_and_mousse_qty = ?, freeze_dried_fish_qty = ?, status = ? WHERE id = ?",
      [
        fullName,
        email,
        phone,
        address,
        ymy_cookies_cats,
        ymy_cookies_dogs,
        tilapia_feast,
        cat_and_mousse,
        freeze_dried_fish,
        status,
        orderId
      ]
    );

    return redirect(`/orders?success=Order updated successfully`);
  } catch (error) {
    console.error("Failed to update order:", error);
    return redirect("/orders?error=Failed to update order");
  }
};