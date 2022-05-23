import { proxy, useSnapshot } from "valtio"

import { CartItem, Product, Shop } from "types"

interface Store {
  shop: Shop | undefined
  items: CartItem[]
}

const initialStore = {
  shop: undefined,
  items: [],
}

const getStore = () => {
  const isSSR = typeof window === "undefined"
  if (!isSSR) {
    const lsStore = JSON.parse(localStorage.getItem("cart"))
    return proxy<Store>(lsStore || initialStore)
  }

  return proxy<Store>(initialStore)
}

export const store = getStore()

/////// actions
export const setItems = (items: CartItem[]) => {
  store.items = items
}

export const resetCart = (shop: Shop) => {
  store.shop = shop
  store.items = initialStore.items
}

export const addItem = (product: Product, quantity: number) => {
  store.items.push({ ...product, quantity })
}

export const removeItem = (id: string) => {
  store.items = store.items.filter((item) => item.id !== id)
}

export const updateItemQuantity = (id: string, quantity: number) => {
  const item = store.items.find((item) => item.id === id)
  if (item) item.quantity = quantity
}

export const getItem = (id: string) => {
  return store.items.find((item) => item.id === id)
}

/////////////

export const isEmpty = () => {
  return totalItemsAmount() === 0
}

export const getItems = () => {
  return useSnapshot(store).items
}

export const getShop = () => {
  return useSnapshot(store).shop
}

export const totalItemsAmount = () => {
  return getItems().length
}
