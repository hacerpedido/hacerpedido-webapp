import { getPublicShops } from "#lib/api/server-shops";
import { categories } from "#lib/utils/categories";

import HomeClient from "./home-client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const shops = await getPublicShops(categories[0]);
  return (
    <>
      <title>Hacer Pedido | Pedí a tu comercio favorito por WhatsApp.</title>
      <HomeClient initialShops={shops} />
    </>
  );
}
