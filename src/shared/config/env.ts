export const env = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "MindMap Live",
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  enableGoogleAuth: process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "true",
  enableAi: process.env.NEXT_PUBLIC_ENABLE_AI !== "false",
  enableMinimap: process.env.NEXT_PUBLIC_ENABLE_MINIMAP !== "false",
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? "",
};

export const hasSupabaseConfig = Boolean(env.supabaseUrl && env.supabaseAnonKey);
