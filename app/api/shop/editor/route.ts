import { saveShopWithProductsAction } from "#lib/actions/shop-editor";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await saveShopWithProductsAction(
      body?.shop,
      body?.products ?? null,
    );
    return Response.json(result, { status: result.error ? 400 : 200 });
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Datos inválidos.", error: 1 },
      { status: 400 },
    );
  }
}
