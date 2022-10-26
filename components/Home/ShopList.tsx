import styles from "./ShopList.module.css"

import ShopCard from "@/components/Home/ShopCard"
import type { Shop } from "types"

type Props = {
  shops: Shop[]
}

const ShopList = ({ shops }: Props) => {
  const count = shops.length
  const shopText = count === 1 ? "comercio" : "comercios"
  const countText = count === 0 ? "No hay" : count

  return (
    <div className={styles.list}>
      <p className={styles.count}>
        {countText} {shopText}
      </p>

      {shops.map((shop) => (
        <ShopCard key={shop.slug} shop={shop} />
      ))}
    </div>
  )
}

export default ShopList
