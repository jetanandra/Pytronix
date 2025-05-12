import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import Razorpay from "npm:razorpay@2.9.2";

// Define CORS headers with all necessary fields
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info",
};

// Helper function to create consistent responses with CORS headers
const createResponse = (body, status) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
};

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204, // No content for OPTIONS
      headers: corsHeaders,
    });
  }

  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return createResponse({ error: "Method not allowed" }, 405);
    }

    // Verify user is authenticated by checking Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("Invalid Authorization header:", authHeader);
      return createResponse({ error: "Invalid Authorization header" }, 401);
    }

    // Extract token from Authorization header
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      console.error("Empty token in Authorization header");
      return createResponse({ error: "Empty authentication token" }, 401);
    }

    // Get Supabase environment variables with safe fallbacks for development
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "http://localhost:54321";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables:", {
        url: !!supabaseUrl,
        key: !!supabaseAnonKey
      });
      return createResponse({ error: "Server configuration error" }, 500);
    }

    // Create Supabase client using the token for authentication
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Authenticate the user with the token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError) {
      console.error("Error authenticating user:", userError.message);
      return createResponse({ 
        error: "Authentication failed", 
        details: userError.message 
      }, 401);
    }
    
    if (!user) {
      console.error("No user found for the provided token");
      return createResponse({ error: "User not found" }, 401);
    }
    
    console.log("User authenticated successfully:", user.id);

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      console.error("Error parsing request body:", error.message);
      return createResponse({ error: "Invalid request body" }, 400);
    }

    const { orderId, amount } = requestBody;

    // Validate required fields
    if (!orderId || !amount) {
      console.error("Missing required fields:", { orderId, amount });
      return createResponse({ error: "Missing required fields" }, 400);
    }
    
    // Get Razorpay credentials
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID") || "rzp_test_89CCL7nHE71FCf";
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET") || "w8OhmDRlhg5iaf7Bg1bgQVUX";
    
    // Create Razorpay instance
    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
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
        },
      });
    } catch (razorpayError) {
      console.error("Razorpay order creation error:", 
        razorpayError.error || razorpayError.message || razorpayError);
      return createResponse({ 
        error: "Failed to create Razorpay order", 
        details: razorpayError.error?.description || 
                razorpayError.message || 
                "Payment gateway error" 
      }, 500);
    }

    console.log("Razorpay order created successfully:", razorpayOrder.id);

    // Update the Supabase order with Razorpay order ID and payment details
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        razorpay_order_id: razorpayOrder.id,
        payment_provider: "razorpay",
        payment_details: {
          razorpay_order_id: razorpayOrder.id,
          razorpay_key: razorpayKeyId,
          status: "created"
        }
      })
      .eq("id", orderId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error updating order with razorpay details:", updateError);
      // Log the error but continue as this isn't critical for the payment flow
    }

    return createResponse({
      id: razorpayOrder.id,
      key: razorpayKeyId,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      notes: razorpayOrder.notes
    }, 200);
  } catch (error) {
    console.error("Unexpected error in Razorpay order creation:", error.message || error);
    
    return createResponse({ 
      error: "Failed to create Razorpay order", 
      details: error.message || "An unexpected error occurred" 
    }, 500);
  }
});