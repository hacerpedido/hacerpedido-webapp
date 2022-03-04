import { categories } from "../../../lib/utils/categories"

const pg = require("knex")({
  client: "pg",
  connection: process.env.PG_CONNECTION_STRING,
})

export default async function handle(req, res) {
  const { category } = req.query

  if (!category || category === "" || !categories.includes(category)) {
    res.status(400).json({ error: "Wrong parameters (1)." })

    return
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
    .orderBy("name")

  res.status(200).json(shops)
  res.end()
}
