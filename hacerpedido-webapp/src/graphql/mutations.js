/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createStore = /* GraphQL */ `
  mutation CreateStore(
    $input: CreateStoreInput!
    $condition: ModelStoreConditionInput
  ) {
    createStore(input: $input, condition: $condition) {
      id
      name
      sections {
        items {
          id
          title
          storeID
        }
        nextToken
      }
    }
  }
`;
export const updateStore = /* GraphQL */ `
  mutation UpdateStore(
    $input: UpdateStoreInput!
    $condition: ModelStoreConditionInput
  ) {
    updateStore(input: $input, condition: $condition) {
      id
      name
      sections {
        items {
          id
          title
          storeID
        }
        nextToken
      }
    }
  }
`;
export const deleteStore = /* GraphQL */ `
  mutation DeleteStore(
    $input: DeleteStoreInput!
    $condition: ModelStoreConditionInput
  ) {
    deleteStore(input: $input, condition: $condition) {
      id
      name
      sections {
        items {
          id
          title
          storeID
        }
        nextToken
      }
    }
  }
`;
export const createSection = /* GraphQL */ `
  mutation CreateSection(
    $input: CreateSectionInput!
    $condition: ModelSectionConditionInput
  ) {
    createSection(input: $input, condition: $condition) {
      id
      title
      storeID
      store {
        id
        name
        sections {
          nextToken
        }
      }
      products {
        items {
          id
          sectionID
          name
          description
          price
        }
        nextToken
      }
    }
  }
`;
export const updateSection = /* GraphQL */ `
  mutation UpdateSection(
    $input: UpdateSectionInput!
    $condition: ModelSectionConditionInput
  ) {
    updateSection(input: $input, condition: $condition) {
      id
      title
      storeID
      store {
        id
        name
        sections {
          nextToken
        }
      }
      products {
        items {
          id
          sectionID
          name
          description
          price
        }
        nextToken
      }
    }
  }
`;
export const deleteSection = /* GraphQL */ `
  mutation DeleteSection(
    $input: DeleteSectionInput!
    $condition: ModelSectionConditionInput
  ) {
    deleteSection(input: $input, condition: $condition) {
      id
      title
      storeID
      store {
        id
        name
        sections {
          nextToken
        }
      }
      products {
        items {
          id
          sectionID
          name
          description
          price
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
      sectionID
      section {
        id
        title
        storeID
        store {
          id
          name
        }
        products {
          nextToken
        }
      }
      name
      description
      price
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
      sectionID
      section {
        id
        title
        storeID
        store {
          id
          name
        }
        products {
          nextToken
        }
      }
      name
      description
      price
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
      sectionID
      section {
        id
        title
        storeID
        store {
          id
          name
        }
        products {
          nextToken
        }
      }
      name
      description
      price
    }
  }
`;
