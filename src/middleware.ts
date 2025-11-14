import { auth } from "./app/api/auth/[...nextauth]/route";

export default auth((req) => {
  // Proteção de rotas
});

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*"],
};
