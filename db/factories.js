const { faker } = require("@faker-js/faker");

const DEFAULT_SEED = 135;

function shopFactory(overrides = {}) {
  return {
    id: faker.string.uuid(),
    name: faker.company.name(),
    slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
    region: "CABA",
    username: null,
    category: "Comida",
    address: `${faker.location.streetAddress()}, CABA`,
    notes: "Consultá disponibilidad antes de realizar el pedido.",
    ordersbyphoneorwhatsapp: "whatsapp",
    delivery: "Sí",
    takeaway: "Sí",
    whatsappnumber: "+54911 5555 0101",
    phonenumber: null,
    email: null,
    submittedat: null,
    opentimes: "Lun a sáb, 9:00 a 20:00",
    deliverycost: "1500",
    visibility: "public",
    logo: null,
    background: null,
    typeformtoken: null,
    ordersphonenumber: null,
    orderswhatsappnumber: "+54911 5555 0101",
    ...overrides,
  };
}

function productFactory(overrides = {}) {
  const { shopId, ...rest } = overrides;
  return {
    id: faker.string.uuid(),
    category: "Comida",
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: String(faker.number.int({ min: 800, max: 12000 })),
    shopid: shopId || faker.string.uuid(),
    itemnumber: faker.number.int({ min: 1, max: 99 }),
    ...rest,
  };
}

function createDevData() {
  faker.seed(DEFAULT_SEED);
  const categories = [
    "Comida",
    "Cervecerías",
    "Helados y Postres",
    "Panadería",
    "Saludable",
    "Almacén / Kiosko",
    "Cafetería",
    "Bebidas",
    "Otros",
  ];
  const shopNames = [
    "Almacén La Esquina",
    "Panadería CABA",
    "Verde Natural",
    "Dulce Buenos Aires",
    "La Parrilla del Barrio",
    "Pinta Porteña",
    "Helados del Parque",
    "La Masa Madre",
    "Raíces Saludables",
    "Kiosco 24 de Mayo",
    "Café de la Plaza",
    "Bebidas El Encuentro",
    "Casa del Regalo",
    "Sabores de Caballito",
    "Cervecería El Andén",
    "Nube de Azúcar",
    "Pan Caliente",
    "Huerta Urbana",
    "Almacén San Telmo",
    "Café Primera Junta",
    "Brindis Bar",
    "Objetos del Sur",
    "La Cocina de Luli",
    "Birra del Oeste",
    "Postres de la Abuela",
    "El Buen Trigo",
    "Naturalmente",
    "Kiosco Rivadavia",
    "Café Cortado",
    "Bebidas La Vuelta",
    "Mercado del Sol",
    "Comedor El Ceibo",
    "La Fábrica de Cerveza",
    "Dulce Norte",
    "Panadería Belgrano",
    "Verde y Fresco",
    "Almacén del Puente",
    "Café Independencia",
    "La Botella Argentina",
    "Casa Creativa",
    "Olla Popular",
    "Cervezas del Río",
    "Heladería Nuestras Raíces",
    "Horno de Barrio",
    "Semilla Viva",
    "El Kiosquito",
    "Café de los Amigos",
    "Bebidas La Posta",
    "El Rincón Criollo",
    "Mesa Compartida",
  ];
  const neighborhoods = [
    "Palermo", "Caballito", "Belgrano", "Almagro", "Villa Crespo",
    "San Telmo", "Flores", "Recoleta", "Villa Devoto", "Boedo",
  ];
  const regions = ["CABA", "Buenos Aires", "Córdoba", "Santa Fe", "Mendoza"];
  const productNames = {
    Comida: ["Empanadas caseras", "Milanesa completa", "Tarta de verduras", "Locro criollo"],
    "Cervecerías": ["IPA artesanal", "Golden ale", "Porter ahumada", "Pinta tirada"],
    "Helados y Postres": ["Helado de dulce de leche", "Cheesecake", "Brownie tibio", "Copa de frutas"],
    "Panadería": ["Medialunas de manteca", "Pan de campo", "Chipá casero", "Facturas surtidas"],
    Saludable: ["Granola artesanal", "Ensalada fresca", "Jugo prensado", "Bowl de frutas"],
    "Almacén / Kiosko": ["Yerba mate", "Galletitas surtidas", "Lentejas", "Chocolate"],
    "Cafetería": ["Café doble", "Cortado", "Tostado de jamón y queso", "Licuado de banana"],
    Bebidas: ["Agua mineral", "Gaseosa cola", "Vino Malbec", "Jugo de naranja"],
    Otros: ["Alimento para mascotas", "Vela aromática", "Cuaderno artesanal", "Regalo sorpresa"],
  };

  const shops = Array.from({ length: shopNames.length }, (_, index) => {
    const number = index + 1;
    const id = `00000000-0000-0000-0000-${String(number).padStart(12, "0")}`;
    const category = categories[index % categories.length];
    return shopFactory({
      id,
      name: shopNames[index],
      slug: faker.helpers.slugify(shopNames[index]).toLowerCase() + `-${number}`,
      region: regions[index % regions.length],
      category,
      address: `${faker.helpers.arrayElement(neighborhoods)}, ${faker.number.int({ min: 100, max: 9999 })}, ${regions[index % regions.length]}`,
      typeformtoken: `dev-fixture-token-${number}`,
      whatsappnumber: `+54911 5555 ${String(1000 + number).slice(-4)}`,
      orderswhatsappnumber: `+54911 5555 ${String(1000 + number).slice(-4)}`,
    });
  });
  const products = shops.flatMap((shop, shopIndex) =>
    Array.from({ length: 6 + (shopIndex % 5) }, (_, productIndex) =>
      productFactory({
        id: `10000000-0000-0000-${String(shopIndex + 1).padStart(4, "0")}-${String(productIndex + 1).padStart(12, "0")}`,
        shopId: shop.id,
        category: shop.category,
        name: `${faker.helpers.arrayElement(productNames[shop.category])} ${productIndex + 1}`,
        description: `Elaborado en ${shop.name}, con ingredientes seleccionados.`,
        itemnumber: productIndex + 1,
      })
    )
  );
  return { shops, products };
}

module.exports = { shopFactory, productFactory, createDevData };
