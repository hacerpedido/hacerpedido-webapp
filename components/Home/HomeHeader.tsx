import Link from "next/link"
import { useState } from "react"

import Button from "react-bootstrap/Button"
import Modal from "react-bootstrap/Modal"
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  TextStyle,
  ViewStyle,
} from "react-native"

import { HpLogoIcon } from "@/components/icons"
import { colors } from "@/lib/colors"

export default function HomeHeader() {
  const [show, setShow] = useState(false)

  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  const AddShopButton = () => (
    <TouchableOpacity onPress={handleShow}>
      <View style={s.button}>
        <Text style={s.buttonText}>¡Sumá tu comercio!</Text>
      </View>
    </TouchableOpacity>
  )
  const AddShopModal = () => (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Ups...</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Por el momento no estamos haciendo nuevas altas. Próximamente habrá
        novedades :)
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )

  return (
    <View style={s.container}>
      <Link href="/">
        <HpLogoIcon width={177} height={19} color={colors.white} />
      </Link>

      <AddShopButton />

      <AddShopModal />
    </View>
  )
}

type Styles = {
  button: ViewStyle
  buttonText: TextStyle
  container: ViewStyle
}

const s = StyleSheet.create<Styles>({
  button: {
    backgroundColor: colors.lightGreen,
    borderColor: colors.button1,
    borderRadius: 4,
    borderWidth: 1,
    padding: 7,
  },
  buttonText: {
    color: colors.white,
    fontFamily: "Barlow",
    fontWeight: "600",
    fontSize: 14,
  },
  container: {
    alignItems: "center",
    backgroundColor: colors.orangeHP,
    borderBottomWidth: 1,
    borderColor: colors.filterButtonBorder,
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
})
