import { gql } from "apollo-boost";

/* eslint-disable */

export const listShopsWithProducts = /* GraphQL */ gql`
  query ListShops($slug: String) {
    allShops(condition: { slug: $slug }) {
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
        productsByShopid(orderBy: ITEMNUMBER_ASC) {
          nodes {
            id
            category
            name
            price
            description
            itemnumber
          }
        }
      }
    }
  }
`;
