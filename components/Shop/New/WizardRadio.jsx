export default function WizardRadio({ name, options, checked, handleChange, validation }) {
  return (
    <div>
      {options.map((option, index) => (
        <div key={index}>
          <label>
            {option}
            <input
              type="radio"
              name={name}
              value={option}
              checked={option === checked}
              onChange={handleChange}
              ref={validation}
            />
          </label>
        </div>
      ))}
    </div>
  );
}
