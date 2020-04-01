/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createShop = /* GraphQL */ `
  mutation CreateShop(
    $input: CreateShopInput!
    $condition: ModelShopConditionInput
  ) {
    createShop(input: $input, condition: $condition) {
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
  }
`;
export const updateShop = /* GraphQL */ `
  mutation UpdateShop(
    $input: UpdateShopInput!
    $condition: ModelShopConditionInput
  ) {
    updateShop(input: $input, condition: $condition) {
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
  }
`;
export const deleteShop = /* GraphQL */ `
  mutation DeleteShop(
    $input: DeleteShopInput!
    $condition: ModelShopConditionInput
  ) {
    deleteShop(input: $input, condition: $condition) {
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
  }
`;
export const createProduct = /* GraphQL */ `
  mutation CreateProduct(
    $input: CreateProductInput!
    $condition: ModelProductConditionInput
  ) {
    createProduct(input: $input, condition: $condition) {
      id
      shopID
      category
      name
      description
    }
  }
`;
export const updateProduct = /* GraphQL */ `
  mutation UpdateProduct(
    $input: UpdateProductInput!
    $condition: ModelProductConditionInput
  ) {
    updateProduct(input: $input, condition: $condition) {
      id
      shopID
      category
      name
      description
    }
  }
`;
export const deleteProduct = /* GraphQL */ `
  mutation DeleteProduct(
    $input: DeleteProductInput!
    $condition: ModelProductConditionInput
  ) {
    deleteProduct(input: $input, condition: $condition) {
      id
      shopID
      category
      name
      description
    }
  }
`;
