import { forwardRef } from "react"
import type { FieldError } from "react-hook-form"
import styled from "styled-components"

import { colors } from "@/lib/colors"

type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>

type Props = InputProps & {
  label: string
  error: FieldError
}

const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, ...inputProps }, ref: React.Ref<HTMLInputElement>) => {
    return (
      <Container>
        {label && <Label>{label}</Label>}

        <StyledInput ref={ref} {...inputProps} />

        {error && <Error>{error.message}</Error>}
      </Container>
    )
  }
)

Input.displayName = "Input"

const Container = styled.div`
  margin-bottom: 10px;
  margin-top: 0.25em;
  display: flex;
`

const Label = styled.label`
  color: ${colors.lightGrey3};
  font-family: Barlow;
  font-size: 10px;
  font-weight: bold;
  margin-bottom: 8px;
  text-transform: uppercase;
`

const Error = styled.span`
  color: ${colors.error};
  font-size: 15px;
`

const StyledInput = styled.input`
  border-radius: 2px;
  border: 1px solid ${({ error }) => (error ? colors.error : colors.lightGrey2)};
  color: ${colors.brown};
  font-family: Barlow;
  font-size: 15px;
  padding: 10px 11px;
`

export default Input
