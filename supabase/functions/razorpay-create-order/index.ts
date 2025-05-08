import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import Razorpay from "npm:razorpay@2.9.2";

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

    // Get auth token
    const token = authHeader.replace("Bearer ", "");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || "",
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", details: userError?.message }),
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
    const { orderId, amount } = await req.json();

    // Validate required fields
    if (!orderId || !amount) {
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
    
    // Create Razorpay instance
    const razorpay = new Razorpay({
      key_id: Deno.env.get("RAZORPAY_KEY_ID") || "rzp_test_89CCL7nHE71FCf",
      key_secret: Deno.env.get("RAZORPAY_KEY_SECRET") || "w8OhmDRlhg5iaf7Bg1bgQVUX",
    });

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: "INR",
      receipt: `receipt_${orderId.substring(0, 8)}`,
      notes: {
        order_id: orderId,
        user_id: user.id
      },
    });

    // Update the Supabase order with Razorpay order ID
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        razorpay_order_id: order.id,
        payment_provider: "razorpay",
        payment_details: {
          ...order,
          status: "created"
        }
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("Error updating order with razorpay details:", updateError);
      // Continue anyway, not critical
    }

    return new Response(
      JSON.stringify({
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        notes: order.notes
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
    console.error("Razorpay order creation error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to create Razorpay order", 
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