// src/services/Facade/CheckoutFacade.ts
import { useCarrito } from "../../store/carrito.store";
import { DeliveryCalculator } from "../Pricing/DeliveryCalculator";
import { FlatDelivery } from "../Pricing/strategies/FlatDelivery";

export type MetodoPago = "yape" | "efectivo";

export type Pedido = {
  id: string;
  fecha: string; // ISO
  estado: "CREADO" | "ACEPTADO" | "ENTREGADO";
  items: ReturnType<typeof useCarrito.getState>["items"];
  subtotal: number;
  delivery: number;
  total: number;
  metodo: MetodoPago;
};

export class CheckoutFacade {
  // ✅ nada de "constructor(private ...)" — declaramos el campo explícito
  private deliveryCalc: DeliveryCalculator;

  constructor() {
    this.deliveryCalc = new DeliveryCalculator(new FlatDelivery());
  }

  // opcional: cambiar estrategia desde fuera si quieres (tests/reglas futuras)
  setDeliveryCalculator(calc: DeliveryCalculator) {
    this.deliveryCalc = calc;
  }

  async confirmar(metodo: MetodoPago): Promise<Pedido> {
    const { items, subtotal, clear } = useCarrito.getState();

    const sub = subtotal();
    const delivery = this.deliveryCalc.calcular(sub);

    const pedido: Pedido = {
      id: crypto.randomUUID(),
      fecha: new Date().toISOString(),
      estado: "CREADO",
      items,
      subtotal: sub,
      delivery,
      total: sub + delivery,
      metodo, // ← guardamos el método de pago
    };

    // persistimos en historial (mock)
    try {
      const raw = localStorage.getItem("historial");
      const hist = raw ? JSON.parse(raw) : [];
      hist.push(pedido);
      localStorage.setItem("historial", JSON.stringify(hist));
    } catch {
      // si algo falla con localStorage, seguimos sin romper el flujo
    }

    clear(); // vacía el carrito
    return pedido;
  }
}
