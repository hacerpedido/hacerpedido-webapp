/* eslint-disable */

export const listShopsForHome = /* GraphQL */ `
  query ListShops(
    $filter: ModelShopFilterInput
    $limit: Int
    $nextToken: String
    # orderBy: name
  ) {
    listShops(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        slug
        name
        category
        address
        notes
        ordersWhatsAppNumber
        ordersPhoneNumber
        openTimes
        deliveryCost
        logo
        background
        products {
          nextToken
        }
      }
      nextToken
    }
  }
`;


export const listShopsWithProducts = /* GraphQL */ `
  query ListShops(
    $filter: ModelShopFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listShops(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        slug
        name
        category
        address
        notes
        whatsAppNumber
        phoneNumber
        ordersWhatsAppNumber
        ordersPhoneNumber
        openTimes
        deliveryCost
        logo
        background
        products {
          items {
            id
            category
            name
            price
            description
            itemNumber
          }
          nextToken
        }
      }
      nextToken
    }
  }
`;
