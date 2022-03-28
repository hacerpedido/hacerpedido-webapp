import storage from "redux-persist/lib/storage" // defaults to localStorage for web

const createNoopStorage = () => {
  return {
    getItem(_key) {
      return Promise.resolve(null)
    },
    setItem(_key, value) {
      return Promise.resolve(value)
    },
    removeItem(_key) {
      return Promise.resolve()
    },
  }
}

const isClient = () => typeof window !== "undefined"

const customStorage = isClient() ? storage : createNoopStorage()

export default customStorage
