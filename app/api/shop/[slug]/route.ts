import { getPublicShop } from "#lib/api/server-shops";
import { serializePublicShops } from "#lib/utils/public-shop";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  if (!slug) {
    return Response.json({ error: "Wrong parameters (1)." }, { status: 400 });
  }

  const shop = await getPublicShop(slug);
  return Response.json(serializePublicShops(shop ? [shop] : []));
}
