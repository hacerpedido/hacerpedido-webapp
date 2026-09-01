import ShopFooter from "#components/Shop/ShopFooter";
import ShopView from "#components/Shop/ShopView";
import { getPublicShop } from "#lib/api/server-shops";

import { notFound } from "next/navigation";
import styles from "../../pages/[slug].module.css";

export const dynamic = "force-dynamic";

export default async function PublicShopPage({
  params,
}: {
  params: { slug: string };
}) {
  const shop = await getPublicShop(params.slug);
  if (!shop) notFound();

  return (
    <main className={styles.page}>
      <title>{shop.name} | Hacer Pedido</title>
      <meta content="/logo512.png" property="og:image" />
      <meta content={shop.name} property="og:description" />
      <meta content="article" property="og:type" />
      <meta content="Hacer Pedido" property="og:site_name" />
      <meta content={shop.name} property="og:title" />
      <meta
        content={`https://hacerpedido.com/${shop.slug}`}
        property="og:url"
      />
      <meta content="summary" property="twitter:card" />
      <meta content={shop.name} property="twitter:title" />
      <meta content={shop.name} property="twitter:description" />
      <meta
        content={`https://hacerpedido.com/${shop.slug}`}
        property="twitter:url"
      />
      <ShopView shop={shop} />
      <ShopFooter shop={shop} />
    </main>
  );
}
