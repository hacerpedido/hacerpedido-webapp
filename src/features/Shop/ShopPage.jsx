import React, { useLayoutEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { Text } from "react-native";
import { Helmet } from "react-helmet-async";

import { loading, query } from "../../shopsSlice";
import { listShopsWithProducts } from "../../graphql/shop";
import ShopView from "./Shop";
import Loading from "../../components/Loading";
import { useApolloClient } from "@apollo/react-hooks";

export default () => {
  const isLoading = useSelector((state) => state.loading);
  const shops = useSelector((state) => state.shops);
  const dispatch = useDispatch();
  const client = useApolloClient();

  let { slug } = useParams();

  useLayoutEffect(() => {
    dispatch(loading(true));

    async function getData() {
      const shopData = await client.query({
        query: listShopsWithProducts,
        variables: {
          slug,
        },
      });
      let fetchedShops = shopData.data.allShops.nodes;
      dispatch(query(fetchedShops));
    }
    getData().catch((error) => {
      console.log(JSON.stringify(error, null, 2));
    });
  }, [slug, dispatch, client]);

  // Just in case
  const shop = shops.find((x) => x.slug === slug);

  if (shop === undefined) {
    return isLoading ? (
      <Loading />
    ) : (
      <Text>Sin comercios en la base de datos para {slug}</Text>
    );
  }

  let products = shop?.productsByShopid?.nodes ?? [];

  return (
    <>
      <Helmet>
        <title>{shop.name}</title>
        <meta
          property="og:image"
          content="https://comercios.hacerpedido.com/wp-content/uploads/2020/03/cropped-Favicon.png"
        />
        <meta property="og:description" content={shop.name} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Hacer Pedido" />
        <meta property="og:title" content={shop.name} />
        <meta
          property="og:url"
          content={"https://hacerpedido.com/" + shop.slug}
        />
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:title" content={shop.name} />
        <meta property="twitter:description" content={shop.name} />
        <meta
          property="twitter:url"
          content={"https://hacerpedido.com/" + shop.slug}
        />
      </Helmet>

      <ShopView products={products} shop={shop} />
    </>
  );
};
