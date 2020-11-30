import { Step, Steps, Wizard } from "react-albus";
import { StyleSheet } from "react-native";
import { useSelector } from "react-redux";

import WelcomeStep from "components/Shop/New/WelcomeStep";
import WizardStep from "components/Shop/New/WizardStep";
import { categories as shopCategories } from "lib/utils/categories.js";

export default function NewShopPage() {
  const name = useSelector((state) => state.newShop.name);
  const shopName = useSelector((state) => state.newShop.shopName);

  return (
    <Wizard style={styles.container}>
      <Steps>
        <Step id="welcomeStep" render={({ next }) => <WelcomeStep next={next} />} />

        <Step
          id="nameStep"
          render={({ next, previous }) => (
            <WizardStep name="name" label={"¿Cómo es tu nombre? *"} next={next} previous={previous} />
          )}
        />

        <Step
          id="shopNameStep"
          render={({ next, previous }) => (
            <WizardStep
              name="shopName"
              label={`Mucho gusto ${name}, ¿Cuál es el nombre de tu negocio? *`}
              next={next}
              previous={previous}
            />
          )}
        />

        <Step
          id="categoryStep"
          render={({ next, previous }) => (
            <WizardStep
              name="category"
              label={`En que categoria de estas estaria ${shopName}?`}
              options={shopCategories}
              next={next}
              previous={previous}
            />
          )}
        />

        <Step
          id="lastStep"
          render={({ previous }) => (
            <div>
              OK
              <br />
              <button onClick={previous}>Volver</button>
            </div>
          )}
        />
      </Steps>
    </Wizard>
  );
}

const styles = StyleSheet.create({
  container: {},
});

// 3 - ¿En qué categoría de estas entraría ___?
//
// Comida
// Cafetería
// Panadería
// Helados y Postres
// Bebidas alcohólicas
// Productos saludables
// Kiosco, almacén, minimercado
// Otro
//
// 4 - ¿En qué ciudad está ubicado ___?
//
// Mar del Plata
// Capital Federal
// Necochea
// Tandil
// Balcarce
// Bahía Blanca
// Otra
//
// 5 - ¿Cuál es la dirección de tu negocio?
// Si solamente hacés Delivery y no tenés un local a la calle escribí "No"
//
// 6 -  ¿Cuáles son tus horarios?
// Ej: Martes a Sábado - 10:00 a 17:00
//
// 7 -  ¿Con qué WhatsApp recibís pedidos de tus clientes?
// Numero de telefono
//
// 8 - ¿Usás otro teléfono más para tomar pedidos?
// Ej: teléfono fijo u otro celular. Si no tenés otro teléfono, simplemente pulsa "Enter" para saltar a la siguiente pregunta
//
// 9 - ¿A qué número de WhatsApp querés que nos comuniquemos con vos?
// Al mismo con el que tomo pedidos
// Otro
//
//
// 10 - ¿Cuál es el costo del delivery?
// Por ejemplo: "$50" o "Sin costo"
//
// 11 - ¿Cuál es tu e-mail? Por acá nos vamos a poner en contacto para pedirte el logotipo de tu negocio y tu listado de precios.
// Campo de email
//
//
// ¡Gracias _____!
//
// En los próximos minutos vas a recibir un email nuestro con los próximos pasos a seguir.
//
// Quedate tranquile, que este servicio es totalmente gratis y sin comisiones.
