import type { NextConfig } from "next";

const backend = process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  async rewrites() {
    // O navegador sempre chama caminho relativo; o Next reescreve do lado do
    // servidor. Sem CORS, e sem a armadilha de localhost:8080 (navegador) vs
    // backend:8080 (container) — ver docs Decisoes D9.
    return [
      { source: "/api/:path*", destination: `${backend}/api/:path*` },
      { source: "/actuator/:path*", destination: `${backend}/actuator/:path*` },
    ];
  },
};

export default nextConfig;
