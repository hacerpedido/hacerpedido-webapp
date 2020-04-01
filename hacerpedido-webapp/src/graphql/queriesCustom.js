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
