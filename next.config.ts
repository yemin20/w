import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

const nextConfig = {
  output: "standalone" as const,
  serverExternalPackages: ["iyzipay"],
};

export default withNextIntl(nextConfig);
