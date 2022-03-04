// NOTE: based on https://elazizi.com/forms-in-react-native-the-right-way

import { createElement, useRef, useEffect } from "react"
import type { FieldError } from "react-hook-form"
import type { RegisterOptions } from "react-hook-form/dist/types"
import type { TextInput } from "react-native"

interface ValidationMap {
  [key: string]: RegisterOptions
}
interface ErrorMap {
  [key: string]: FieldError | undefined
}
interface Props {
  children: JSX.Element | JSX.Element[]
  register: ({ name }: { name: string }, validation: RegisterOptions) => void
  errors: ErrorMap
  validation: ValidationMap
  setValue: (name: string, value: string, validate?: boolean) => void
}

const Form = ({ register, errors, setValue, validation, children }: Props) => {
  const Inputs = useRef<Array<TextInput>>([])

  useEffect(() => {
    ;(Array.isArray(children) ? [...children] : [children]).forEach((child) => {
      if (child.props.name)
        register({ name: child.props.name }, validation[child.props.name])
    })
  }, [register, children, validation])
  return (
    <>
      {(Array.isArray(children) ? [...children] : [children]).map(
        (child, i) => {
          return child.props.name
            ? createElement(child.type, {
                ...{
                  ...child.props,
                  ref: (e: TextInput) => {
                    Inputs.current[i] = e
                  },
                  onChangeText: (v: string) =>
                    setValue(child.props.name, v, true),
                  onSubmitEditing: () => {
                    Inputs.current[i + 1]
                      ? Inputs.current[i + 1].focus()
                      : Inputs.current[i].blur()
                  },
                  //onBlur: () => triggerValidation(child.props.name),
                  blurOnSubmit: false,
                  //name: child.props.name,
                  error: errors[child.props.name],
                },
              })
            : child
        }
      )}
    </>
  )
}

export default Form
