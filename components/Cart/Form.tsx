import { useState } from "react"
import type { SubmitHandler } from "react-hook-form"
import { Controller, useForm } from "react-hook-form"
import {
  TouchableHighlight,
  StyleSheet,
  Text,
  View,
  TextStyle,
  ViewStyle,
} from "react-native"

import { WhatsAppIcon } from "@/components/icons"
import Input from "@/components/Input"
import Switch from "@/components/Switch"
import { colors } from "@/lib/colors"
import { useAppSelector as useSelector } from "@/lib/hooks"
import type { CartFormValues } from "types"
// import {useSpring, animated} from "react-spring";

const Form = ({ onSubmit }: { onSubmit: SubmitHandler<CartFormValues> }) => {
  const shop = useSelector((state) => state.shop.shop)
  const [takeaway, setTakeaway] = useState(false)

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CartFormValues>({ mode: "onBlur" })

  const toggleTakeAway = () => {
    const value = !takeaway
    setTakeaway(value)
  }

  // const animatedProps = useSpring({
  //   opacity: !takeaway ? 1 : 0,
  //   maxHeight: !takeaway ? 100 : 0,
  // })

  return (
    <View style={styles.container}>
      <Switch onToggle={toggleTakeAway} value={takeaway} />

      <Controller
        render={({ field }) => (
          <Input
            {...field}
            autoFocus
            label="Tu Nombre"
            placeholder="¿Cómo te llamás?"
            autoCompleteType="name"
            error={errors.name}
            maxLength={50}
          />
        )}
        control={control}
        name="name"
        rules={{
          required: {
            value: true,
            message: "Necesitamos tu nombre",
          },
        }}
      />

      {/*  TODO: fix */}
      {/* <AnimatedView style={animatedProps}> */}
      {takeaway || (
        <Controller
          render={({ field }) => (
            <Input
              {...field}
              label="Tu Dirección"
              autoCompleteType="street-address"
              placeholder="¿A dónde lo mandamos?"
              error={errors.address}
              maxLength={50}
            />
          )}
          control={control}
          name="address"
          rules={{
            required: {
              value: true,
              message: "Necesitamos tu dirección",
            },
          }}
        />
      )}
      {/* </AnimatedView> */}

      <Controller
        render={({ field }) => (
          <Input
            {...field}
            label="Notas"
            placeholder="¿Querés hacer alguna aclaración?"
            multiline
            numberOfLines={2}
            maxLength={500}
          />
        )}
        name="notes"
        control={control}
      />

      <Text style={styles.notes}>
        Por favor,
        <Text style={textStyles.bold}> confirmá el precio final </Text>
        con el comercio. No somos responsables de modificaciones en el menú.
      </Text>

      <TouchableHighlight onPress={handleSubmit(onSubmit)} underlayColor="none">
        <div className="bounza">
          <View style={[styles.buttonWhatsApp, styles.button]}>
            <Text style={styles.textContainer} numberOfLines={1}>
              <View style={styles.icon}>
                <WhatsAppIcon color={colors.white} />
              </View>
              <Text style={styles.buttonText}> Pedir a {shop?.name} </Text>
            </Text>
          </View>
        </div>
      </TouchableHighlight>
    </View>
  )
}

// const AnimatedView = animated(View)

export default Form

const textStyles = {
  bold: {
    fontWeight: "bold",
  },
  smallText: {
    fontFamily: "Barlow",
    fontSize: 13,
  },
  largeText: {
    fontFamily: "Barlow",
    fontSize: 16,
    fontWeight: "600",
  },
}

type Styles = {
  button: ViewStyle
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
    justifyContent: "center",
    marginTop: 19,
    paddingVertical: 17,
  },
  buttonText: {
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
    ...textStyles.smallText,
    color: colors.gray4,
    textAlign: "center",
  },
  textContainer: {
    ...textStyles.largeText,
    alignItems: "center",
    color: colors.white,
    flexDirection: "row",
    justifyContent: "center",
  },
})
