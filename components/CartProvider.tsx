import { Fragment, useEffect, useState } from "react"
import { CartProvider as BaseCartProvider } from "react-use-cart"

export default function CartProvider({ children, ...props }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true))

  if (mounted) {
    return <BaseCartProvider {...props}>{children}</BaseCartProvider>
  }

  return <Fragment>{children}</Fragment>
}
