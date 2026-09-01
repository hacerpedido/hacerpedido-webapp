import { useEffect, useState } from "react";

const useWidth = (): number | null => {
  const [width, setWidth] = useState<number | null>(null); // default width, detect on server.

  const handleResize = () => setWidth(window.innerWidth);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  return width;
};

export default useWidth;
