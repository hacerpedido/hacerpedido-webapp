import type { Metadata } from "next";
import EditorClient from "./EditorClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function EditShopPage() {
  return <EditorClient />;
}
