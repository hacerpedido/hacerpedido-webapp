/* eslint-disable */

export const listShopsWithProducts = /* GraphQL */ `
  query ListShops(
    $filter: ModelShopFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listShops(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        category
        address
        notes
        whatsAppNumber
        phoneNumber
        openTimes
        deliveryCost
        logo
        background
        products {
          items {
            id
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
