import { gql } from "apollo-boost";

/* eslint-disable */

export const listShopsForHome = /* GraphQL */ gql`
  query ListShops(
    #$limit: Int = 20,
    $category: String
  ) {
    allShops(
      #first: $limit
      orderBy: NAME_ASC
      condition: { visibility: "public", category: $category }
    ) {
      totalCount
      nodes {
        id
        name
        slug
        region
        category
        address
        notes
        opentimes
        deliverycost
        visibility
        logo
        background
        ordersphonenumber
        orderswhatsappnumber
      }
    }
  }
`;
