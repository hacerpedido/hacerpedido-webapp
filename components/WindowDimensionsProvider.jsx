import React, { createContext, useContext, useState, useEffect } from "react";

export const WindowDimensionsCtx = createContext(null);

const windowDims = () => ({
  height: 100,
  width: 100,
  // height: (typeof window !== "undefined" && window.innerHeight) || 0,
  // width: (typeof window !== "undefined" && window.innerWidth) || 0,
});

const WindowDimensionsProvider = ({ children }) => {
  const [dimensions, setDimensions] = useState(windowDims());
  // useEffect(() => {
  //   const handleResize = () => {
  //     setDimensions(windowDims());
  //   };
  // if (typeof window !== "undefined") {
  //   window.addEventListener("resize", handleResize);
  //   return () => {
  //     window.removeEventListener("resize", handleResize);
  //   };
  // }
  // }, []);
  return <WindowDimensionsCtx.Provider value={dimensions}>{children}</WindowDimensionsCtx.Provider>;
};

export default WindowDimensionsProvider;

export const useWindowDimensions = () => {
  return useContext(WindowDimensionsCtx);
};
