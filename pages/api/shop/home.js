import { withSentry } from '@sentry/nextjs';
import { categories } from "../../../lib/utils/categories";

const pg = require("knex")({
  client: "pg",
  connection: process.env.PG_CONNECTION_STRING,
});

const handler = async (req, res) => {
  const { category } = req.query;

  if (!category || category === "" || !categories.includes(category)) {
    res.status(400).json({ error: "Wrong parameters (1)." });

    return;
  }

  const shops = await pg
    .select(
      "id",
      "name",
      "slug",
      "region",
      "category",
      "address",
      "notes",
      "opentimes",
      "deliverycost",
      "visibility",
      "logo",
      "background",
      "ordersphonenumber",
      "orderswhatsappnumber"
    )
    .from("shops")
    .where("visibility", "=", "public")
    .where("category", "=", category)
    .orderBy("updated_at", "desc");

  res.status(200).json(shops);
  res.end();
}

export default withSentry(handler);

export const config = {
  api: {
    externalResolver: true,
  },
};
