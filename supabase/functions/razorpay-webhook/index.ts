import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import crypto from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-razorpay-signature",
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

    // Get the Razorpay signature from headers
    const razorpaySignature = req.headers.get("x-razorpay-signature");
    
    // Get request body as text
    const rawBody = await req.text();
    
    // If we're processing a webhook from Razorpay (with signature), verify it
    if (razorpaySignature) {
      // Webhook secret - this should be the secret you set in Razorpay dashboard
      const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") || "Debanga@91";
      
      // Verify signature if provided
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");
      
      if (expectedSignature !== razorpaySignature) {
        return new Response(
          JSON.stringify({ error: "Invalid signature" }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }
    }
    
    // Parse the JSON payload
    const payload = JSON.parse(rawBody);
    
    // Check if this is a payment.authorized event
    if (payload.event === "payment.authorized" || payload.event === "payment.captured") {
      const payment = payload.payload.payment.entity;
      const orderId = payment.notes.order_id;
      const razorpayOrderId = payment.order_id;
      const razorpayPaymentId = payment.id;
      
      // Update the order in Supabase
      if (orderId) {
        // Initialize Supabase client with service role key (for admin access)
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL") || "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false,
            },
          }
        );
        
        // Update order status and payment details
        const { error } = await supabase
          .from('orders')
          .update({
            status: 'processing', // Payment complete, move to processing
            payment_details: {
              method: 'razorpay',
              status: 'paid',
              razorpay_order_id: razorpayOrderId,
              razorpay_payment_id: razorpayPaymentId,
              payment_timestamp: new Date().toISOString(),
              amount: payment.amount / 100, // Convert from paise to rupees
            },
            razorpay_payment_id: razorpayPaymentId
          })
          .eq('id', orderId);
          
        if (error) {
          console.error("Error updating order:", error);
          return new Response(
            JSON.stringify({ error: "Failed to update order" }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
              },
            }
          );
        }
      }
    }
    
    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
    
  } catch (error) {
    console.error("Webhook processing error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to process webhook", 
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