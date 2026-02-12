import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

const nextConfig = {
  serverExternalPackages: ["iyzipay"],
};

export default withNextIntl(nextConfig);
