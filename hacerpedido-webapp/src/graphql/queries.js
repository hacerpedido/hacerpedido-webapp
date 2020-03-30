/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getShop = /* GraphQL */ `
  query GetShop($id: ID!) {
    getShop(id: $id) {
      id
      name
      slug
      region
      typeformToken
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
        typeformToken
      }
      nextToken
    }
  }
`;
