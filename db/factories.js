const { faker } = require("@faker-js/faker");

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
  const neighborhoods = [
    "Palermo",
    "Caballito",
    "Belgrano",
    "Almagro",
    "Villa Crespo",
    "San Telmo",
    "Flores",
    "Recoleta",
    "Villa Devoto",
    "Boedo",
  ];
  const regions = ["CABA", "Buenos Aires", "Córdoba", "Santa Fe", "Mendoza"];
  const logoImages = [
    "/images/backgrounds/comida.jpg",
    "/images/backgrounds/cerveceria.jpg",
    "/images/backgrounds/helados.jpg",
    "/images/backgrounds/panaderia.jpg",
    "/images/backgrounds/saludable.jpg",
    "/images/backgrounds/kiosko.jpg",
    "/images/backgrounds/cafe.jpg",
    "/images/backgrounds/bebida.jpg",
    "/images/backgrounds/otros.jpg",
  ];
  const productNames = {
    Comida: [
      "Empanadas salteñas",
      "Milanesa napolitana",
      "Tarta de verdura",
      "Locro criollo",
      "Ravioles caseros",
      "Parrillada para dos",
    ],
    Cervecerías: [
      "IPA artesanal",
      "Golden ale tirada",
      "Porter ahumada",
      "Pinta roja",
      "Picada cervecera",
      "Lager porteña",
    ],
    "Helados y Postres": [
      "Helado de dulce de leche",
      "Cheesecake casero",
      "Brownie tibio",
      "Copa de frutas",
      "Alfajor artesanal",
      "Flan con crema",
    ],
    Panadería: [
      "Medialunas de manteca",
      "Pan de campo",
      "Chipá casero",
      "Facturas surtidas",
      "Focaccia de oliva",
      "Torta rogel",
    ],
    Saludable: [
      "Granola artesanal",
      "Ensalada fresca",
      "Jugo prensado",
      "Bowl de frutas",
      "Hummus de garbanzo",
      "Tostada integral",
    ],
    "Almacén / Kiosko": [
      "Yerba mate",
      "Galletitas surtidas",
      "Lentejas secas",
      "Chocolate con leche",
      "Arroz largo fino",
      "Maní salado",
    ],
    Cafetería: [
      "Café doble",
      "Cortado",
      "Tostado de jamón y queso",
      "Licuado de banana",
      "Café con leche",
      "Medialuna rellena",
    ],
    Bebidas: [
      "Agua mineral",
      "Gaseosa cola",
      "Vino Malbec",
      "Jugo de naranja",
      "Fernet con cola",
      "Cerveza lata",
    ],
    Otros: [
      "Alimento para mascotas",
      "Vela aromática",
      "Cuaderno artesanal",
      "Regalo sorpresa",
      "Planta de interior",
      "Bolsa reutilizable",
    ],
  };

  const categorySlugs = {
    Comida: "comida",
    Cervecerías: "cervecerias",
    "Helados y Postres": "helados-postres",
    Panadería: "panaderia",
    Saludable: "saludable",
    "Almacén / Kiosko": "almacen-kiosko",
    Cafetería: "cafeteria",
    Bebidas: "bebidas",
    Otros: "otros",
  };
  const shops = categories.flatMap((category, categoryIndex) =>
    Array.from({ length: 100 }, (_, shopIndex) => {
      const number = categoryIndex * 100 + shopIndex + 1;
      const id = `00000000-0000-0000-0001-${String(number).padStart(12, "0")}`;
      const name = `${category} ${shopIndex + 1}`;
      const region = regions[number % regions.length];
      const phone = `+54911 5555 ${String(1000 + number).slice(-4)}`;
      const logo =
        shopIndex % 3 === 0 ? logoImages[number % logoImages.length] : null;
      return shopFactory({
        id,
        name,
        slug: `dev-${categorySlugs[category]}-${String(shopIndex + 1).padStart(3, "0")}`,
        region,
        category,
        address: `${neighborhoods[shopIndex % neighborhoods.length]}, ${100 + number}, ${region}`,
        typeformtoken: `dev-fixture-token-${number}`,
        whatsappnumber: phone,
        orderswhatsappnumber: phone,
        logo,
      });
    }),
  );
  const products = shops.flatMap((shop, shopIndex) =>
    Array.from({ length: 6 + (shopIndex % 5) }, (_, productIndex) =>
      productFactory({
        id: `10000000-0000-0000-${String(shopIndex + 1).padStart(4, "0")}-${String(productIndex + 1).padStart(12, "0")}`,
        shopId: shop.id,
        category: shop.category,
        name: `${productNames[shop.category][productIndex % productNames[shop.category].length]} ${productIndex + 1}`,
        description: `Elaborado en ${shop.name}, con ingredientes seleccionados.`,
        price: String(900 + ((shopIndex * 137 + productIndex * 251) % 11000)),
        itemnumber: productIndex + 1,
      }),
    ),
  );
  return { shops, products };
}

module.exports = { shopFactory, productFactory, createDevData };
