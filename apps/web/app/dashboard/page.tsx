import { supabase } from "@/lib/supabaseClient";

export default function DashboardPage() {
  // supabase is already imported as a singleton

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard!</p>
    </div>
  );
} 