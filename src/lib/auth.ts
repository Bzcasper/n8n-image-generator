import { createClient } from "@neondatabase/neon-js";
import { BetterAuthReactAdapter } from "@neondatabase/neon-js/auth/react/adapters";

export const client = createClient({
  auth: {
    adapter: BetterAuthReactAdapter(),
    url: import.meta.env.VITE_NEON_AUTH_URL,
  },
  dataApi: { url: import.meta.env.VITE_NEON_DATA_API_URL },
});

console.log('VITE_NEON_AUTH_URL:', import.meta.env.VITE_NEON_AUTH_URL);
console.log('VITE_NEON_DATA_API_URL:', import.meta.env.VITE_NEON_DATA_API_URL);
console.log('client:', client);
console.log('client.auth:', client.auth);
console.log('typeof client.auth:', typeof client.auth);
if (client.auth) {
  console.log("'getBetterAuthInstance' in client.auth:", 'getBetterAuthInstance' in client.auth);
} else {
  console.log('client.auth is undefined');
}

export const authClient = client.auth;