import { getPublicShops } from "#lib/api/server-shops";
import { categories } from "#lib/utils/categories";
import { serializePublicShops } from "#lib/utils/public-shop";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const category = new URL(request.url).searchParams.get("category");

  if (!category || !categories.includes(category)) {
    return Response.json({ error: "Wrong parameters (1)." }, { status: 400 });
  }

  const shops = await getPublicShops(category);
  return Response.json(serializePublicShops(shops));
}
