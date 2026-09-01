import ShopFooter from "#components/Shop/ShopFooter";
import ShopView from "#components/Shop/ShopView";
import { getPublicShop } from "#lib/api/server-shops";

import { notFound } from "next/navigation";
import styles from "../../pages/[slug].module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const shop = await getPublicShop(params.slug);
  if (!shop) return {};

  return {
    title: `${shop.name} | Hacer Pedido`,
    openGraph: {
      title: shop.name,
      description: shop.name,
      type: "article",
      siteName: "Hacer Pedido",
      url: `https://hacerpedido.com/${shop.slug}`,
      images: ["/logo512.png"],
    },
    twitter: {
      card: "summary",
      title: shop.name,
      description: shop.name,
      url: `https://hacerpedido.com/${shop.slug}`,
    },
  };
}

export default async function PublicShopPage({
  params,
}: {
  params: { slug: string };
}) {
  const shop = await getPublicShop(params.slug);
  if (!shop) notFound();

  return (
    <main className={styles.page}>
      <ShopView shop={shop} />
      <ShopFooter shop={shop} />
    </main>
  );
}
