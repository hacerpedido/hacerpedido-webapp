import { gql } from "apollo-boost";

export const getShopWithDetails = /* GraphQL */ gql`
  query shopBySlug($slug: String!) {
    shopBySlug(slug: $slug) {
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
`;

export const getShopByIdWithDetails = /* GraphQL */ gql`
  query shopById($id: UUID!) {
    shopById(id: $id) {
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
`;

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
        typeformtoken
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
