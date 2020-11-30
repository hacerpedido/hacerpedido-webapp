import { Text } from "react-native";

export default function WelcomeStep({ next }) {
  return (
    <div>
      <Text>
        Bienvenido a HacerPedido.com. Te vamos a hacer unas preguntas muy breves para que completes. Recordá que este es
        un servicio gratuito y sin comisiones pensado para comercios que cuentan con Delivery propio o Takeaway (para
        llevar)
      </Text>

      <br />

      <button onClick={next}>
        <Text>Comenzar</Text>
      </button>
    </div>
  );
}
