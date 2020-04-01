import React from "react";
import { Link } from "react-router-dom";

export default function Admin() {
  return (
    <>
      <h3>Admin</h3>
      <ul>
        <li>
          <Link to="/admin/shops-import">Import Shops</Link>
        </li>
      </ul>
    </>
  );
}
