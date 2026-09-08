import { useEffect, useState } from "react";

const useWidth = (): number | null => {
  const [width, setWidth] = useState<number | null>(null); // default width, detect on server.

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
};

export default useWidth;
