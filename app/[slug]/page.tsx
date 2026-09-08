import ShopFooter from "#components/Shop/ShopFooter";
import ShopView from "#components/Shop/ShopView";
import {
  getDevelopmentShopEditToken,
  getPublicShop,
} from "#lib/api/server-shops";

import { notFound } from "next/navigation";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const shop = await getPublicShop(slug);
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
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const shop = await getPublicShop(slug);
  if (!shop) notFound();

  const editToken =
    process.env.NODE_ENV === "development"
      ? await getDevelopmentShopEditToken(slug)
      : null;

  return (
    <main className={styles.page}>
      <ShopView shop={shop} {...(editToken ? { editToken } : {})} />
      <ShopFooter shop={shop} />
    </main>
  );
}
