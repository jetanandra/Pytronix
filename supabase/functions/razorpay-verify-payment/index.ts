import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import crypto from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Verify user is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing Authorization header in verify-payment request");
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // Log the request for debugging
    console.log("Payment verification request received");

    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error("User authentication error:", userError);
      return new Response(
        JSON.stringify({ error: "Authentication failed", details: userError.message }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    if (!user) {
      console.error("No user found in the session");
      return new Response(
        JSON.stringify({ error: "Authentication failed", details: "Auth session missing!" }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (e) {
      console.error("Error parsing request JSON:", e);
      return new Response(
        JSON.stringify({ error: "Invalid request format" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    const { orderId, razorpayOrderId, razorpayPaymentId } = requestBody;

    // Validate required fields
    if (!orderId || !razorpayOrderId || !razorpayPaymentId) {
      console.error("Missing required fields in verify-payment request");
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    console.log(`Verifying payment: orderId=${orderId}, razorpayOrderId=${razorpayOrderId}, razorpayPaymentId=${razorpayPaymentId}`);

    // Get the order to verify user ownership
    const { data: order, error: getOrderError } = await supabase
      .from("orders")
      .select("user_id, razorpay_order_id")
      .eq("id", orderId)
      .single();

    if (getOrderError) {
      console.error("Error fetching order:", getOrderError);
      return new Response(
        JSON.stringify({ error: "Failed to get order", details: getOrderError.message }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Verify user owns this order
    if (order.user_id !== user.id) {
      console.error("User ID mismatch", { orderUserId: order.user_id, userId: user.id });
      return new Response(
        JSON.stringify({ error: "Unauthorized access to order" }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Verify Razorpay order ID matches
    if (order.razorpay_order_id !== razorpayOrderId) {
      console.error("Order ID mismatch", { storedOrderId: order.razorpay_order_id, receivedOrderId: razorpayOrderId });
      return new Response(
        JSON.stringify({ error: "Order ID mismatch" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Update order status and payment details
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "processing",
        razorpay_payment_id: razorpayPaymentId,
        payment_details: {
          status: "paid",
          razorpay_payment_id: razorpayPaymentId,
          payment_timestamp: new Date().toISOString()
        }
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("Error updating order:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update order", details: updateError.message }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    console.log("Payment verified successfully for order:", orderId);
    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment verified and order updated"
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error("Payment verification error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to verify payment", 
        details: error.message 
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});