import { saveShopWithProductsAction } from "#lib/actions/shop-editor";
import { getShopByToken } from "#lib/api/server-shops";
import { validateShopEditorInput } from "#lib/validation/shop-editor";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noStore = { headers: { "Cache-Control": "no-store" } };

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");

  if (!token) {
    return Response.json(
      { error: "Wrong parameters (1)." },
      { status: 400, ...noStore },
    );
  }

  const shop = await getShopByToken(token);
  if (!shop) {
    return Response.json(
      { error: "No hay un comercio para ese token." },
      { status: 404, ...noStore },
    );
  }

  return Response.json(shop, noStore);
}

/** Keep the legacy editor POST contract while the editor migrates. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, products } = body ?? {};

    if (!token) {
      return Response.json(
        { error: "Wrong parameters (1)." },
        { status: 400, ...noStore },
      );
    }

    const validationError = validateShopEditorInput(body);
    if (validationError) {
      return Response.json(
        { error: validationError },
        { status: 400, ...noStore },
      );
    }

    const result = await saveShopWithProductsAction(body, products ?? null);
    if (result.error) {
      return Response.json(
        { error: result.message },
        { status: 400, ...noStore },
      );
    }

    return Response.json({ success: true, message: result.message }, noStore);
  } catch {
    return Response.json(
      { error: "Wrong parameters (1)." },
      { status: 400, ...noStore },
    );
  }
}
