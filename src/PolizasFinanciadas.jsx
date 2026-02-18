import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

function getSemaforo(poliza) {

  if (poliza.endoso === "") return "rojo";

  const baseCompleta =
    poliza.montada &&
    poliza.recaudada &&
    poliza.firmada &&
    poliza.desembolsada;

  const baseParcial =
    poliza.montada ||
    poliza.recaudada ||
    poliza.firmada ||
    poliza.desembolsada;

  if (poliza.delegada) {
    if (poliza.endoso === "SI") {
      if (baseCompleta && poliza.certificacion) return "verde";
    } else {
      if (baseCompleta) return "verde";
    }
    return "amarillo";
  }

  if (poliza.endoso === "SI") {
    if (baseCompleta && poliza.certificacion) return "verde";
    if (baseParcial || poliza.certificacion) return "amarillo";
    return "rojo";
  }

  if (baseCompleta) return "verde";
  if (baseParcial) return "amarillo";

  return "rojo";
}

export default function PolizasFinanciadas() {

  // 🚨 ALERTA AUTOMATICA CORREO ENDOSO
useEffect(() => {

  polizas.forEach(p => {

    if(
      p.endoso === "SI" &&
      p.certificacion === true &&
      p.correoEndoso === "NO"
    ){
      console.log("⚠️ FALTA ENVIAR CORREO ENDOSO:", p.numeroPoliza);
    }

  });

},[polizas]);

const entidadesLista = [
"Finesa","Previcredito","Crediestado","Credivalores",
"ALLIANZ","ESTADO","SURA","MUNDIAL","PREVISORA",
"AXA COLPATRIA","MAPFRE","SBS","SOLIDARIA","HDI"
];

const aseguradorasLista = [
"ALLIANZ","ESTADO","SURA","MUNDIAL","PREVISORA",
"AXA COLPATRIA","MAPFRE","SBS","SOLIDARIA","HDI"
];

const [polizas,setPolizas] = useState([]);

const ref = collection(db,"polizasFinanciadas");


// 🔥 CARGAR DESDE FIREBASE (SOLUCION BORRADO)
useEffect(()=>{
const cargar = async ()=>{
const snap = await getDocs(ref);
const datos = snap.docs.map(d=>({firebaseId:d.id,...d.data()}));
setPolizas(datos);
};
cargar();
},[]);


// 🔥 GUARDADO AUTOMATICO (SIN BOTONES)
useEffect(()=>{
polizas.forEach(async(p)=>{
if(!p.firebaseId){
const docRef = await addDoc(ref,p);
p.firebaseId = docRef.id;
}else{
await updateDoc(doc(db,"polizasFinanciadas",p.firebaseId),p);
}
});
},[polizas]);



const agregarPoliza = ()=>{
setPolizas([
...polizas,
{
id:Date.now(),
numeroPoliza:"",
fecha:"",
placa:"",
nombre:"",
entidad:"Finesa",
aseguradora:"SURA",
gestor:"",
cuotas:1,
valor:"",
montada:false,
recaudada:false,
firmada:false,
endoso:"",
certificacion:false,
desembolsada:false,
delegada:false,
delegadaA:"",
correoEndoso:""   // ✉️ NUEVO CAMPO
}
]);
};

const eliminarPoliza = (id)=>{
setPolizas(polizas.filter(p=>p.id!==id));
};

const actualizar=(id,campo,valor)=>{
setPolizas(polizas.map(p=>
p.id===id?{...p,[campo]:valor}:p
));
};


return(
<div className="pl-0 pr-4 pt-4 pb-4 w-full text-left">

<h2 className="text-xl font-bold mb-4">Pólizas Financiadas</h2>

<button
onClick={agregarPoliza}
className="mb-4 bg-green-600 text-white px-4 py-2 rounded-lg"
>
+ Póliza Nueva
</button>

<table className="w-full border table-auto -ml-64">

<thead className="bg-gray-100">
<tr>
<th>Estado</th>
<th>Fecha</th>
<th>Póliza</th>
<th>Aseguradora</th>
<th>Placa</th>
<th>Nombre</th>
<th>Entidad</th>
<th>Cuotas</th>
<th>Valor</th>
<th>Montada</th>
<th>Recaudada</th>
<th>Firmada</th>
<th>Desemb.</th>
<th>Endoso</th>
<th>Certif.</th>
<th>Correo Endoso</th> {/* ✉️ NUEVA */}
<th>Deleg.</th>
<th>Delegada a</th>
<th>Gestor</th>
<th>Acción</th>
</tr>
</thead>

<tbody>
{polizas.map(p=>{

const estado=getSemaforo(p);

return(
<tr key={p.id} className="border-b">

<td>
<span className={`inline-block w-4 h-4 rounded-full ${
estado==="verde"?"bg-green-500":
estado==="amarillo"?"bg-yellow-400":"bg-red-500"
}`}/>
</td>

<td>
<input type="date" value={p.fecha}
onChange={(e)=>actualizar(p.id,"fecha",e.target.value)}
className="border rounded px-2 py-1"/>
</td>

<td>
<input value={p.numeroPoliza}
onChange={(e)=>actualizar(p.id,"numeroPoliza",e.target.value)}
className="border rounded px-2 py-1 w-28"/>
</td>

<td>
<select value={p.aseguradora}
onChange={(e)=>actualizar(p.id,"aseguradora",e.target.value)}
className="border rounded px-2 py-1">
{aseguradorasLista.map(a=><option key={a}>{a}</option>)}
</select>
</td>

<td>
<input value={p.placa}
onChange={(e)=>actualizar(p.id,"placa",e.target.value.toUpperCase())}
className="border rounded px-2 py-1 w-24"/>
</td>

<td>
<input value={p.nombre}
onChange={(e)=>actualizar(p.id,"nombre",e.target.value)}
className="border rounded px-2 py-1 w-32"/>
</td>

<td>
<select value={p.entidad}
onChange={(e)=>actualizar(p.id,"entidad",e.target.value)}
className="border rounded px-2 py-1">
{entidadesLista.map(ent=><option key={ent}>{ent}</option>)}
</select>
</td>

<td>
<select value={p.cuotas}
onChange={(e)=>actualizar(p.id,"cuotas",Number(e.target.value))}
className="border rounded px-2 py-1">
{[...Array(12)].map((_,i)=><option key={i+1}>{i+1}</option>)}
</select>
</td>

<td>
<input value={p.valor}
onChange={(e)=>actualizar(p.id,"valor",e.target.value)}
className="border rounded px-2 py-1 w-28"/>
</td>

<td><input type="checkbox" checked={p.montada}
onChange={(e)=>actualizar(p.id,"montada",e.target.checked)}/></td>

<td><input type="checkbox" checked={p.recaudada}
disabled={!p.montada}
onChange={(e)=>actualizar(p.id,"recaudada",e.target.checked)}/></td>

<td><input type="checkbox" checked={p.firmada}
disabled={!p.recaudada}
onChange={(e)=>actualizar(p.id,"firmada",e.target.checked)}/></td>

<td><input type="checkbox" checked={p.desembolsada}
disabled={!p.firmada}
onChange={(e)=>actualizar(p.id,"desembolsada",e.target.checked)}/></td>

<td>
<select value={p.endoso}
onChange={(e)=>actualizar(p.id,"endoso",e.target.value)}
className="border rounded px-1">
<option value="">-</option>
<option value="SI">SI</option>
<option value="NO">NO</option>
</select>
</td>

<td>
{p.endoso==="SI" &&(
<input type="checkbox"
checked={p.certificacion}
disabled={!p.desembolsada}
onChange={(e)=>actualizar(p.id,"certificacion",e.target.checked)}/>
)}
</td>


{/* ✉️ CORREO ENDOSO ENVIADO */}
<td>
{p.endoso==="SI" && p.certificacion &&(
<select
value={p.correoEndoso||""}
onChange={(e)=>actualizar(p.id,"correoEndoso",e.target.value)}
className="border rounded px-1"
>
<option value="">-</option>
<option value="SI">SI</option>
<option value="NO">NO</option>
</select>
)}
</td>

<td>
<input type="checkbox"
checked={p.delegada}
onChange={(e)=>actualizar(p.id,"delegada",e.target.checked)}/>
</td>

<td>
<input value={p.delegadaA||""}
onChange={(e)=>actualizar(p.id,"delegadaA",e.target.value)}
className="border rounded px-2 py-1 w-32"/>
</td>

<td>
<input value={p.gestor}
onChange={(e)=>actualizar(p.id,"gestor",e.target.value)}
className="border rounded px-2 py-1 w-32"/>
</td>

<td>
<button
onClick={()=>eliminarPoliza(p.id)}
className="text-red-600 font-bold px-2"
>
X
</button>
</td>

</tr>
);
})}
</tbody>
</table>

</div>
);
}