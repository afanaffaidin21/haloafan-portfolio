import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

import { legacyRedirects } from "./src/lib/legacy-redirects";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  trailingSlash: true,
  // URLs of the old haloafan.com portfolio (docs/legacy-urls.md).
  async redirects() {
    return legacyRedirects;
  },
};

export default withPayload(nextConfig);
