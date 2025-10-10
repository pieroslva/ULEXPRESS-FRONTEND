// src/components/QtyInput.tsx
type Props = { value:number; onChange:(n:number)=>void; min?:number; max?:number; };
export default function QtyInput({ value, onChange, min=1, max=99 }: Props){
  const clamp = (n:number)=> Math.max(min, Math.min(max, n));
  return (
    <div className="inline-flex items-center border border-white/20 rounded-lg overflow-hidden">
      <button type="button" className="px-3 py-1 bg-white/10 hover:bg-white/20" onClick={()=>onChange(clamp(value-1))}>−</button>
      <input className="w-12 text-center bg-transparent py-1"
             value={value}
             onChange={(e)=>onChange(clamp(parseInt(e.target.value||"0",10)||min))}/>
      <button type="button" className="px-3 py-1 bg-white/10 hover:bg-white/20" onClick={()=>onChange(clamp(value+1))}>+</button>
    </div>
  );
}
