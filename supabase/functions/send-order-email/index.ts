// deno-fmt-ignore-file
// deno-lint-ignore-file
// @ts-nocheck
// Supabase Edge Function: send-order-email
// Sends transactional emails (order received, shipped, etc.) using Resend

const RESEND_API_KEY = "re_HvtiAPoY_4MpoCFFKjrYUNhqrQwk1mULp";
const FROM_EMAIL = "no-reply@phytronix.com"; // Change to your verified sender

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

interface OrderEmailPayload {
  to: string;
  type: "order_received" | "order_shipped" | "order_delivered";
  order: {
    id: string;
    customer_name: string;
    items: { name: string; quantity: number; price: number }[];
    total: number;
    status: string;
    created_at: string;
    [key: string]: any;
  };
}

function getEmailSubject(type: string) {
  switch (type) {
    case "order_received":
      return "Your order has been received!";
    case "order_shipped":
      return "Your order has been shipped!";
    case "order_delivered":
      return "Your order has been delivered!";
    default:
      return "Order Update";
  }
}

function getOrderEmailHtml(type: string, order: OrderEmailPayload["order"]) {
  return `
    <div style="font-family: Arial, sans-serif;">
      <h2 style="color: #3b82f6;">Phytronix - ${getEmailSubject(type)}</h2>
      <p>Hi ${order.customer_name || "Customer"},</p>
      <p>
        ${
          type === "order_received"
            ? "Thank you for your order! We have received your order and will process it soon."
            : type === "order_shipped"
            ? "Good news! Your order has been shipped."
            : type === "order_delivered"
            ? "Your order has been delivered. We hope you enjoy your purchase!"
            : "Order update."
        }
      </p>
      <h3>Order Details</h3>
      <ul>
        ${order.items
          .map(
            (item) =>
              `<li>${item.name} (x${item.quantity}) - ₹${item.price.toLocaleString()}</li>`
          )
          .join("")}
      </ul>
      <p><strong>Total:</strong> ₹${order.total.toLocaleString()}</p>
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Status:</strong> ${order.status}</p>
      <p style="margin-top: 2em; color: #888; font-size: 0.9em;">If you have any questions, reply to this email or contact our support.</p>
      <p style="color: #3b82f6; font-weight: bold;">Thank you for shopping with Phytronix!</p>
    </div>
  `;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let payload: OrderEmailPayload;
  try {
    payload = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!payload.to || !payload.type || !payload.order) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Compose email
  const subject = getEmailSubject(payload.type);
  const html = getOrderEmailHtml(payload.type, payload.order);

  // Send email via Resend API
  const resendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: payload.to,
      subject,
      html,
    }),
  });

  if (!resendRes.ok) {
    const errorText = await resendRes.text();
    return new Response(JSON.stringify({ error: "Failed to send email", details: errorText }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}); 