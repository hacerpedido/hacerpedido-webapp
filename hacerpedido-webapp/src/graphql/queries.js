/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getShop = /* GraphQL */ `
  query GetShop($id: ID!) {
    getShop(id: $id) {
      id
      name
      slug
      region
      userName
      category
      address
      notes
      ordersByPhoneOrWhatsApp
      delivery
      takeaway
      whatsAppNumber
      phoneNumber
      email
      submittedAt
      openTimes
      deliveryCost
      visibility
      logo
      background
      typeformToken
      prods {
        items {
          id
          shopID
          category
          name
          description
        }
        nextToken
      }
    }
  }
`;
export const listShops = /* GraphQL */ `
  query ListShops(
    $filter: ModelShopFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listShops(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        slug
        region
        userName
        category
        address
        notes
        ordersByPhoneOrWhatsApp
        delivery
        takeaway
        whatsAppNumber
        phoneNumber
        email
        submittedAt
        openTimes
        deliveryCost
        visibility
        logo
        background
        typeformToken
        prods {
          items {
          id
          shopID
          category
          name
          description
        }
          nextToken
        }
      }
      nextToken
    }
  }
`;
export const getProduct = /* GraphQL */ `
  query GetProduct($id: ID!) {
    getProduct(id: $id) {
      id
      shopID
      category
      name
      description
    }
  }
`;
export const listProducts = /* GraphQL */ `
  query ListProducts(
    $filter: ModelProductFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listProducts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        shopID
        category
        name
        description
      }
      nextToken
    }
  }
`;
