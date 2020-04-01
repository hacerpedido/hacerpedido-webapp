/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateShop = /* GraphQL */ `
  subscription OnCreateShop {
    onCreateShop {
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
export const onUpdateShop = /* GraphQL */ `
  subscription OnUpdateShop {
    onUpdateShop {
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
export const onDeleteShop = /* GraphQL */ `
  subscription OnDeleteShop {
    onDeleteShop {
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
export const onCreateProduct = /* GraphQL */ `
  subscription OnCreateProduct {
    onCreateProduct {
      id
      shopID
      category
      name
      description
    }
  }
`;
export const onUpdateProduct = /* GraphQL */ `
  subscription OnUpdateProduct {
    onUpdateProduct {
      id
      shopID
      category
      name
      description
    }
  }
`;
export const onDeleteProduct = /* GraphQL */ `
  subscription OnDeleteProduct {
    onDeleteProduct {
      id
      shopID
      category
      name
      description
    }
  }
`;
