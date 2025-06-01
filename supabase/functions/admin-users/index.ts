import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // Auth check
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  // Use service role for admin actions
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Get the user making the request
  const jwt = authHeader.replace("Bearer ", "");
  const { data: userData } = await supabaseAdmin.auth.getUser(jwt);
  if (!userData?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: corsHeaders,
    });
  }
  const isAdmin = userData.user.user_metadata?.role === "admin";
  if (!isAdmin) {
    return new Response(JSON.stringify({ error: "Admin only" }), {
      status: 403,
      headers: corsHeaders,
    });
  }

  if (req.method === "GET") {
    // List all users with profile info
    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: corsHeaders,
      });
    }
    // Get profiles
    const ids = users.users.map((u) => u.id);
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .in("id", ids);

    // Merge user and profile info
    const result = users.users.map((u) => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      role: u.user_metadata?.role || "user",
      banned: u.user_metadata?.banned || false,
      profile: profiles?.find((p) => p.id === u.id) || null,
    }));

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method === "POST") {
    const { action, userId } = await req.json();
    if (!userId || !action) {
      return new Response(JSON.stringify({ error: "Missing params" }), {
        status: 400,
        headers: corsHeaders,
      });
    }
    if (action === "promote") {
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { role: "admin" },
      });
    } else if (action === "demote") {
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { role: "user" },
      });
    } else if (action === "ban") {
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { banned: true },
      });
    } else if (action === "unban") {
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { banned: false },
      });
    } else if (action === "delete") {
      await supabaseAdmin.auth.admin.deleteUser(userId);
    } else {
      return new Response(JSON.stringify({ error: "Unknown action" }), {
        status: 400,
        headers: corsHeaders,
      });
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: corsHeaders,
  });
}); 