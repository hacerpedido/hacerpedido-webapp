import React, { useEffect, useReducer } from "react";
import { Link } from "react-router-dom";
import API, { graphqlOperation } from "@aws-amplify/api";

import { listStores } from "./graphql/queries";

// Action Types
const QUERY = "QUERY";

const initialState = {
  stores: []
};

const reducer = (state, action) => {
  switch (action.type) {
    case QUERY:
      return { ...state, stores: action.stores };
    default:
      return state;
  }
};

export default function Home() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    async function getData() {
      const storeData = await API.graphql(graphqlOperation(listStores));
      dispatch({ type: QUERY, stores: storeData.data.listStores.items });
    }
    getData();
  }, []);

  return (
    <div className="App">
      <h2>Listado de comercios</h2>

      <div>
      <ul>
        {state.stores.length > 0 ? (
          state.stores.map(store => (
            <li key={store.id}>
              <Link to={store.id}>{store.name}</Link>
            </li>
          ))
        ) : (
          <p>Sin comercios en la base de datos</p>
        )}
      </ul>
    </div>
    </div>
  );
}