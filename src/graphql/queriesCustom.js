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
        ordersPhoneNumber
        ordersWhatsAppNumber
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
        ordersPhoneNumber
        ordersWhatsAppNumber
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
