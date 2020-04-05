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
      ordersPhoneNumber
      ordersWhatsAppNumber
      products {
        items {
          id
          category
          name
          description
          price
          itemNumber
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
      ordersPhoneNumber
      ordersWhatsAppNumber
      products {
        items {
          id
          category
          name
          description
          price
          itemNumber
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
      ordersPhoneNumber
      ordersWhatsAppNumber
      products {
        items {
          id
          category
          name
          description
          price
          itemNumber
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
      category
      name
      description
      price
      shop {
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
      itemNumber
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
      category
      name
      description
      price
      shop {
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
      itemNumber
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
      category
      name
      description
      price
      shop {
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
      itemNumber
    }
  }
`;
