import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import Razorpay from "npm:razorpay@2.9.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Initialize Razorpay with your key_id and key_secret
const razorpay = new Razorpay({
  key_id: Deno.env.get("RAZORPAY_KEY_ID") || "rzp_test_89CCL7nHE71FCf", 
  key_secret: Deno.env.get("RAZORPAY_KEY_SECRET") || "w8OhmDRlhg5iaf7Bg1bgQVUX", 
});

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

    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
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
    const { amount, currency, receipt, notes, orderId } = await req.json();

    // Validate required fields
    if (!amount || !currency || !receipt) {
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

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise (1 INR = 100 paise)
      currency, // Should be "INR" for Indian Rupees
      receipt,  // Your internal order ID or reference
      notes: {
        ...notes,
        user_id: user.id,
        order_id: orderId,
      },
    });

    // Update the order in Supabase with Razorpay order ID
    if (orderId) {
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_details: {
            ...notes,
            razorpay_order_id: order.id,
            status: 'created',
            method: 'razorpay',
          },
          razorpay_order_id: order.id
        })
        .eq('id', orderId);

      if (updateError) {
        console.error("Error updating order with razorpay details:", updateError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: order,
        key_id: razorpay.key_id,
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