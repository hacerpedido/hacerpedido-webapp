import { useState } from "react"
import type { SubmitHandler } from "react-hook-form"
import { useForm } from "react-hook-form"
import {
  StyleSheet,
  Text,
  View,
  TextStyle,
  ViewStyle,
  TouchableHighlight,
} from "react-native"

import { useSpring, animated } from "react-spring"

import { WhatsAppIcon } from "@/components/icons"
import Input from "@/components/Input"
import Switch from "@/components/Switch"
import { colors } from "@/lib/colors"
import { getShop } from "store"
import type { CartFormValues } from "types"

const Form = ({ onSubmit }: { onSubmit: SubmitHandler<CartFormValues> }) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<CartFormValues>({ mode: "onBlur" })

  const shop = getShop()
  const [isTakeaway, setIsTakeaway] = useState(false)

  const animatedProps = useSpring({
    opacity: isTakeaway ? 0 : 1,
    maxHeight: isTakeaway ? 0 : 100,
  })

  const validation = {
    name: {
      required: {
        value: true,
        message: "Necesitamos tu nombre",
      },
    },
    address: {
      required: {
        value: true,
        message: "Necesitamos tu dirección",
      },
    },
  }

  const SubmitButton = () => (
    <TouchableHighlight
      underlayColor={"none"}
      onPress={() => {}}
      style={styles.buttonContainer}
    >
      <View style={[styles.buttonWhatsApp, styles.button]}>
        <Text style={styles.buttonText}>
          <WhatsAppIcon color={colors.white} />
          {`  Pedir a ${shop?.name}`}
        </Text>
      </View>
    </TouchableHighlight>
  )

  return (
    <View style={styles.container}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Switch
          onToggle={() => setIsTakeaway(!isTakeaway)}
          value={isTakeaway}
        />

        <Input
          {...register("name", validation["name"])}
          autoCompleteType="name"
          error={errors.name}
          label="Tu nombre"
          maxLength={50}
          placeholder="¿Cómo te llamás?"
        />

        <animated.div style={animatedProps}>
          <Input
            {...register("address", validation["address"])}
            autoCompleteType="street-address"
            error={errors.address}
            label="Tu Dirección"
            maxLength={50}
            placeholder="¿A dónde lo mandamos?"
          />
        </animated.div>

        {/*  TODO: make this a textarea */}
        <Input
          {...register("notes")}
          label="Notas"
          placeholder="¿Querés hacer alguna aclaración?"
          maxLength={500}
        />

        <Text style={styles.notes}>
          Por favor,
          <b> confirmá el precio final </b>
          con el comercio. No somos responsables de modificaciones en el menú.
        </Text>

        <SubmitButton />
      </form>
    </View>
  )
}

export default Form

type Styles = {
  button: ViewStyle
  buttonCall: ViewStyle
  buttonContainer: ViewStyle
  buttonText: TextStyle
  buttonWhatsApp: ViewStyle
  container: ViewStyle
  icon: ViewStyle
  notes: TextStyle
  textContainer: ViewStyle
}

const styles = StyleSheet.create<Styles>({
  button: {
    alignItems: "center",
    borderRadius: 4,
    borderWidth: 1,
    flexDirection: "row",
    paddingVertical: 20,
    justifyContent: "center",
    marginTop: 12,
    textAlign: "center",
  },
  buttonCall: {
    backgroundColor: colors.orangeHP,
    borderColor: colors.filterButtonBorder,
  },
  buttonContainer: {
    flex: 1,
  },
  buttonText: {
    color: colors.white,
    flex: 1,
    fontFamily: "Barlow",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 5,
  },
  buttonWhatsApp: {
    backgroundColor: colors.lightGreen,
    borderColor: colors.button1,
  },
  container: {
    backgroundColor: colors.white,
    paddingBottom: 30,
    paddingTop: 21,
  },
  icon: {
    top: 2,
  },
  notes: {
    fontFamily: "Barlow",
    fontSize: 13,
    color: colors.gray4,
    textAlign: "center",
  },
  textContainer: {
    fontFamily: "Barlow",
    fontWeight: "600",
    alignItems: "center",
    color: colors.white,
    flexDirection: "row",
    justifyContent: "center",
  },
})
