import * as React from "react";

function SvgChevronDown(props) {
  return (
    <svg height={24} width={24} {...props}>
      <path
        d="M12 15.5a.997.997 0 01-.707-.293l-4-4a.999.999 0 111.414-1.414l3.305 3.305 3.293-3.18a1 1 0 011.39 1.439l-4 3.862A.997.997 0 0112 15.5"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}

export default SvgChevronDown;
