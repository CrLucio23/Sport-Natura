import SignaturePad from "./SignaturePad.jsx";
import comuniArray from "comuni-json/comuni.json";

const comuniList = comuniArray.map((c) => ({
  nome: c.nome,
  provincia: c.sigla,
}));
const todayIso = () => {
  const now = new Date();
  return new Date(now - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
};

export default function ParticipantForm({ index, data, onChange }) {
  function handleField(field, value) {
    onChange(index, { ...data, [field]: value });
  }

  return (
    <div className="participant-card">
      <div className="participant-hd">
        <div className="participant-num">0{index + 1}</div>
        <div className="participant-lbl">Partecipante {index + 1}</div>
      </div>

      <div className="form-grid">
        <div className="field-group">
          <label>Nome *</label>
          <input
            value={data.nome || ""}
            onChange={(e) => handleField("nome", e.target.value)}
            required
          />
        </div>
        <div className="field-group">
          <label>Cognome *</label>
          <input
            value={data.cognome || ""}
            onChange={(e) => handleField("cognome", e.target.value)}
            required
          />
        </div>
        <div className="field-group">
          <label>Luogo di nascita *</label>
          <input
            value={data.luogoNascita || ""}
            onChange={(e) => handleField("luogoNascita", e.target.value)}
            required
          />
          <datalist id={`luoghi-nascita-${index}`}>
            {comuniList.map((c) => (
              <option key={`${c.nome}-${c.provincia}`} value={c.nome}>
                {c.nome} ({c.provincia})
              </option>
            ))}
          </datalist>
        </div>
        <div className="field-group">
          <label>Data di nascita *</label>
          <input
            type="date"
            value={data.dataNascita || ""}
            onChange={(e) => handleField("dataNascita", e.target.value)}
            required
          />
        </div>
        <div className="field-group">
          <label>Città di residenza *</label>
          <input
            value={data.cittaResidenza || ""}
            onChange={(e) => {
              const value = e.target.value;
              const comune = comuniList.find(
                (c) => c.nome.toLowerCase() === value.toLowerCase(),
              );

              onChange(index, {
                ...data,
                cittaResidenza: value,
                provincia: comune ? comune.provincia : data.provincia,
              });
            }}
            onChange={(e) => handleField("cittaResidenza", e.target.value)}
            required
          />
          <datalist id={`citta-residenza-${index}`}>
            {comuniList.map((c) => (
              <option key={`${c.nome}-${c.provincia}`} value={c.nome}>
                {c.nome} ({c.provincia})
              </option>
            ))}
          </datalist>
        </div>
        <div className="field-group">
          <label>Provincia *</label>
          <input
            maxLength={2}
            placeholder="es. NA"
            value={data.provincia || ""}
            onChange={(e) =>
              handleField("provincia", e.target.value.toUpperCase())
            }
            required
            style={{ textTransform: "uppercase" }}
          />
        </div>
        <div className="field-group" style={{ gridColumn: "1 / -1" }}>
          <label>Via e numero civico *</label>
          <input
            value={data.indirizzo || ""}
            onChange={(e) => handleField("indirizzo", e.target.value)}
            placeholder="es. Via Roma 12"
            required
          />
        </div>
        <div className="field-group">
          <label>Cellulare / Telefono *</label>
          <input
            value={data.cellulare || ""}
            onChange={(e) => handleField("cellulare", e.target.value)}
            required
          />
        </div>
        <div className="field-group">
          <label>Data di compilazione</label>
          <input
            type="date"
            value={data.dataCompilazione || todayIso()}
            onChange={(e) => handleField("dataCompilazione", e.target.value)}
          />
        </div>
      </div>

      <div className="field-group" style={{ marginTop: "0.5rem" }}>
        <label>Firma *</label>
        <SignaturePad onChange={(sig) => handleField("firma", sig)} />
      </div>
    </div>
  );
}
