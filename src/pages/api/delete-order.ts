import type { APIRoute } from "astro";
import { getSecret } from "astro:env/server";
import { createClient } from "@libsql/client";

export const POST: APIRoute = async ({ request, redirect }) => {
  // Check authentication
  const cookies = new Map();
  request.headers.get("cookie")?.split(";").forEach(cookie => {
    const [name, value] = cookie.trim().split("=");
    cookies.set(name, value);
  });
  
  const isAuthenticated = cookies.get("admin-auth") === "true";
  
  if (!isAuthenticated) {
    return redirect("/admin-login?error=auth", 302);
  }
  
  try {
    const formData = await request.formData();
    
    // Extract and properly type the orderId
    const orderId = String(formData.get("orderId") || "");
    
    console.log("Deleting order:", orderId);
    
    if (!orderId) {
      console.error("Invalid order ID");
      return redirect("/orders?error=Invalid+order+ID", 302);
    }
    
    // Initialize database connection
    const dbUrl = getSecret("TURSO_DATABASE_URL");
    const authToken = getSecret("TURSO_AUTH_TOKEN");
    
    if (!dbUrl || !authToken) {
      console.error("Missing database credentials");
      return redirect("/orders?error=Database+configuration+error", 302);
    }
    
    const db = createClient({
      url: dbUrl,
      authToken: authToken,
    });
    
    // Delete the order from the database
    const result = await db.execute(
      `DELETE FROM orders WHERE id = ?`,
      [orderId]
    );
    
    console.log("Delete result:", result);
    
    // Redirect back to orders page with success message
    return redirect("/orders?success=Order+deleted+successfully", 302);
    
  } catch (error) {
    console.error("Failed to delete order:", error);
    return redirect("/orders?error=Failed+to+delete+order", 302);
  }
};