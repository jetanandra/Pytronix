import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import Razorpay from "npm:razorpay@2.9.2";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};
Deno.serve(async (req)=>{
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }
  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(JSON.stringify({
        error: "Method not allowed"
      }), {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }
    // Verify user is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing Authorization header");
      return new Response(JSON.stringify({
        error: "Missing Authorization header"
      }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }
    // Get auth token
    const token = authHeader.replace("Bearer ", "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables");
      return new Response(JSON.stringify({
        error: "Server configuration error"
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    });
    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      console.error("User authentication error:", userError?.message);
      return new Response(JSON.stringify({
        error: "Unauthorized",
        details: userError?.message
      }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }
    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      console.error("Error parsing request body:", error);
      return new Response(JSON.stringify({
        error: "Invalid request body"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }
    const { orderId, amount } = requestBody;
    // Validate required fields
    if (!orderId || !amount) {
      console.error("Missing required fields:", {
        orderId,
        amount
      });
      return new Response(JSON.stringify({
        error: "Missing required fields"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }
    // Get Razorpay credentials
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID") || "rzp_test_89CCL7nHE71FCf";
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET") || "w8OhmDRlhg5iaf7Bg1bgQVUX";
    // Create Razorpay instance
    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret
    });
    // Ensure amount is a number and convert to paise (smallest currency unit)
    const amountInPaise = Math.round(parseFloat(amount) * 100);
    console.log("Creating Razorpay order for amount:", amount, "amountInPaise:", amountInPaise);
    // Create Razorpay order
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: `receipt_${orderId.substring(0, 8)}`,
        notes: {
          order_id: orderId,
          user_id: user.id
        }
      });
    } catch (razorpayError) {
      console.error("Razorpay order creation error:", razorpayError);
      return new Response(JSON.stringify({
        error: "Failed to create Razorpay order",
        details: razorpayError.message || "Payment gateway error"
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }
    console.log("Razorpay order created successfully:", razorpayOrder.id);
    // Update the Supabase order with Razorpay order ID and payment details
    const { error: updateError } = await supabase.from("orders").update({
      payment_provider: "razorpay",
      payment_details: {
        razorpay_order_id: razorpayOrder.id,
        razorpay_key: razorpayKeyId,
        status: "created"
      }
    }).eq("id", orderId);
    if (updateError) {
      console.error("Error updating order with razorpay details:", updateError);
    // Log the error but continue as this isn't critical for the payment flow
    }
    return new Response(JSON.stringify({
      id: razorpayOrder.id,
      key: razorpayKeyId,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      notes: razorpayOrder.notes
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error("Unexpected error in Razorpay order creation:", error);
    return new Response(JSON.stringify({
      error: "Failed to create Razorpay order",
      details: error.message || "An unexpected error occurred"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  }
});
