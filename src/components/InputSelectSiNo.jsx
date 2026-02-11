function InputSelectSiNo({ value, setValue, label }) {

    return (
        <div className="form-group">
            <label>{label}</label>
            <select
                className="input"
                value={value || ""}
                onChange={(e) => setValue(e.target.value)}
            >
                <option value="">Seleccione una opción</option>
                <option value="SI">SI</option>
                <option value="NO">NO</option>
            </select>
        </div>
    );
}

export default InputSelectSiNo;