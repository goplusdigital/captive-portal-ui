import type { NextConfig } from "next";
import withFlowbiteReact from "flowbite-react/plugin/nextjs";

const nextConfig: NextConfig = {
  images: {
    domains: ["profile.line-scdn.net", "line-scdn.net", "obs.line-scdn.net", "captive.goplus.co.th"],
  },
};

export default (nextConfig);