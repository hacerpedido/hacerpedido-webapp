import type * as React from "react";

function SvgArrowLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg height={21} width={11} {...props}>
      <title>ArrowLeft</title>
      <path
        d="M11 2.86364L4.125 10.0227L11 17.1818L9.625 20.0455L0 10.0227L9.625 0L11 2.86364Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}

export default SvgArrowLeft;
