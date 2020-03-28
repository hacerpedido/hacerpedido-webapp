import React from "react";
import {
  Link,
} from "react-router-dom";

export default function Home() {
  return (
    <div className="App">
      <h2>Listado de comercios</h2>

      <StoreList />
    </div>
  );
}

function StoreList() {
  return (
    <div>
      <ul>
        <li>
          <Link to={`/pirulo`}>Pirulo</Link>
        </li>
        <li>
          <Link to={`/mengano`}>Mengano</Link>
        </li>
      </ul>
    </div>
  );
}
