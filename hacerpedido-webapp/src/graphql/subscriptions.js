/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateStore = /* GraphQL */ `
  subscription OnCreateStore {
    onCreateStore {
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
export const onUpdateStore = /* GraphQL */ `
  subscription OnUpdateStore {
    onUpdateStore {
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
export const onDeleteStore = /* GraphQL */ `
  subscription OnDeleteStore {
    onDeleteStore {
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
export const onCreateSection = /* GraphQL */ `
  subscription OnCreateSection {
    onCreateSection {
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
export const onUpdateSection = /* GraphQL */ `
  subscription OnUpdateSection {
    onUpdateSection {
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
export const onDeleteSection = /* GraphQL */ `
  subscription OnDeleteSection {
    onDeleteSection {
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
export const onCreateProduct = /* GraphQL */ `
  subscription OnCreateProduct {
    onCreateProduct {
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
export const onUpdateProduct = /* GraphQL */ `
  subscription OnUpdateProduct {
    onUpdateProduct {
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
export const onDeleteProduct = /* GraphQL */ `
  subscription OnDeleteProduct {
    onDeleteProduct {
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
