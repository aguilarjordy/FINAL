import { useState } from "react";
import { collectSample } from "../services/operations";

export default function OperationTrainer() {
  const [type, setType] = useState("number");
  const [value, setValue] = useState("");

  const handleSave = async () => {
    try {
      const res = await collectSample(type, value);
      alert(res.data.message);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <h1>Entrenador de Operaciones</h1>
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="number">Número</option>
        <option value="operator">Operador</option>
      </select>
      <input
        type="text"
        placeholder="Ejemplo: 5 o +"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button onClick={handleSave}>Guardar muestra</button>
    </div>
  );
}
