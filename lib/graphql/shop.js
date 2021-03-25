import { gql } from "apollo-boost";

export const updateShop = /* GraphQL */ gql`
  mutation UpdateShop($input: UpdateShopByIdInput!) {
    updateShopById(input: $input) {
      shop {
        id
        name
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
