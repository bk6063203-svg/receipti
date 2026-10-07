/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    // Phase 02: these sections live on the landing page.
    // Remove entries when full pages land in a later phase.
    return [
      { source: "/how-it-works", destination: "/#how-it-works", permanent: false },
      { source: "/business", destination: "/#business", permanent: false },
      { source: "/security", destination: "/#security", permanent: false },
      // Phase 13: nav destinations reuse landing sections / real routes.
      { source: "/product", destination: "/#product", permanent: false },
      { source: "/customers", destination: "/#customers", permanent: false },
      { source: "/merchants", destination: "/#business", permanent: false },
      { source: "/verification", destination: "/verify", permanent: false },
      // Phase 13: customer receipt detail IS the shared receipt page.
      { source: "/customer/receipts/:id", destination: "/receipt/:id", permanent: false },
      // Phase 04: /r/ links (incl. Phase 03 QR codes) resolve to the receipt page.
      { source: "/r/:ref", destination: "/receipt/:ref", permanent: false },
      // Phase 10: legacy integration URLs fold into the integration experience.
      { source: "/merchant/integrations", destination: "/merchant/integration", permanent: false },
      { source: "/merchant/api-keys", destination: "/merchant/integration#api-keys", permanent: false },
    ];
  },
};

export default nextConfig;
