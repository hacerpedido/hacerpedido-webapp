import { SVGProps } from "react"

function ClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={14} height={14} {...props}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M9.333 6.417h-1.75v-1.75a.583.583 0 10-1.166 0V7c0 .323.261.583.583.583h2.333a.583.583 0 100-1.166M7 11.667c-2.573 0-4.667-2.094-4.667-4.667S4.427 2.333 7 2.333 11.667 4.427 11.667 7 9.573 11.667 7 11.667m0-10.5C3.784 1.167 1.167 3.784 1.167 7S3.784 12.833 7 12.833 12.833 10.216 12.833 7 10.216 1.167 7 1.167"
      />
    </svg>
  )
}

export { ClockIcon }
