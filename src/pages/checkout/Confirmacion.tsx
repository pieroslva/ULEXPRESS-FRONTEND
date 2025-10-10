import { useState } from "react";
import { CheckoutFacade } from "../../services/Facade/CheckoutFacade";
import type { MetodoPago } from "../../services/Facade/CheckoutFacade";
import { useCarrito } from "../../store/carrito.store";

const s = (n:number)=> new Intl.NumberFormat("es-PE",{style:"currency",currency:"PEN"}).format(n);

export default function Confirmacion(){
  const [metodo, setMetodo] = useState<MetodoPago>("efectivo");
  const { subtotal } = useCarrito();
  const sub = subtotal();
  const delivery = 5; // si quieres, calcula con la Strategy como haces en Carrito
  const total = sub + delivery;

  const confirmar = async ()=>{
    const pedido = await new CheckoutFacade().confirmar(metodo);
    alert(`Pedido ${pedido.id.slice(0,8)} confirmado.\nMétodo: ${pedido.metodo.toUpperCase()}\nTotal: ${s(pedido.total)}`);
    location.href="/";
  };

  return (
    <section className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Confirmar pedido</h1>

      <div className="space-y-2 border border-white/10 rounded-xl p-4">
        <h2 className="font-semibold">Método de pago</h2>

        <label className="flex items-center gap-2">
          <input
            type="radio" name="pago" value="efectivo"
            checked={metodo==="efectivo"} onChange={()=>setMetodo("efectivo")}
          />
          <span>Efectivo contra entrega</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio" name="pago" value="yape"
            checked={metodo==="yape"} onChange={()=>setMetodo("yape")}
          />
          <span>Yape</span>
        </label>

        {metodo==="yape" && (
          <div className="text-sm text-gray-300">
            Recibirás el número Yape del repartidor al llegar.
          </div>
        )}
      </div>

      <div className="space-y-1 text-sm">
        <div className="flex justify-between"><span>Subtotal</span><span>{s(sub)}</span></div>
        <div className="flex justify-between"><span>Delivery</span><span>{s(delivery)}</span></div>
        <div className="flex justify-between font-semibold text-base">
          <span>Total</span><span>{s(total)}</span>
        </div>
      </div>

      <button onClick={confirmar} className="bg-green-600 hover:bg-green-700 text-white rounded px-4 py-2">
        Confirmar pedido
      </button>
    </section>
  );
}
