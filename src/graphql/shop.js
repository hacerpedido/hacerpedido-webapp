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

export const listAllShopsWithProducts = /* GraphQL */ gql`
  query AllShopsWithProducts {
    allShops {
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
        typeformtoken
        submittedat
        productsByShopid {
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

export const createShop = /* GraphQL */ gql`
  mutation CreateShop($input: CreateShopInput!) {
    createShop(input: $input) {
      shop {
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
        typeformtoken
        submittedat
      }
    }
  }
`;

export const deleteProductById = /* GraphQL */ gql`
  mutation DeleteProduct($input: DeleteProductByIdInput!) {
    deleteProductById(input: $input) {
      product {
        id
      }
    }
  }
`;

export const createProduct = /* GraphQL */ gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      product {
        id
        category
        name
        price
        description
        itemnumber
      }
    }
  }
`;
