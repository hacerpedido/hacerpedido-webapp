import * as React from "react";

function SvgArrowLeft(props) {
  return (
    <svg width={24} height={24} {...props}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M19 11H7.135l3.633-4.36a1 1 0 10-1.536-1.28l-5 6c-.039.047-.059.102-.088.154-.024.042-.053.078-.071.124a.985.985 0 00-.072.358L4 12l.001.004c0 .122.027.243.072.358.018.046.047.082.071.124.029.052.049.107.088.154l5 6a.999.999 0 101.536-1.28L7.135 13H19a1 1 0 000-2"
      />
    </svg>
  );
}

export default SvgArrowLeft;
