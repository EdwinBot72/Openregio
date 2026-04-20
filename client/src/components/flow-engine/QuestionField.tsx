import type { Question } from "@/lib/flow-engine/types";

interface Props {
  question: Question;
  value: string;
  onChange: (v: string) => void;
}

export function QuestionField({ question, value, onChange }: Props) {
  const id = `q-${question.id}`;
  const testId = `field-${question.id}`;

  return (
    <div className="flow-question">
      <label htmlFor={id} className="flow-question-label">
        {question.label}
        {question.required && <span className="flow-question-required"> *</span>}
      </label>
      {question.help && <p className="flow-question-help">{question.help}</p>}

      {question.type === "text" && (
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          className="flow-input"
          data-testid={testId}
        />
      )}

      {question.type === "date" && (
        <input
          id={id}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flow-input"
          data-testid={testId}
        />
      )}

      {question.type === "textarea" && (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          className="flow-textarea"
          rows={3}
          data-testid={testId}
        />
      )}

      {question.type === "select" && (
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flow-input"
          data-testid={testId}
        >
          <option value="">— Maak een keuze —</option>
          {question.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}

      {question.type === "checkbox" && (
        <label
          className={`flow-radio ${value === "ja" ? "is-selected" : ""}`}
          data-testid={testId}
        >
          <input
            type="checkbox"
            checked={value === "ja"}
            onChange={(e) => onChange(e.target.checked ? "ja" : "")}
          />
          <span>{question.placeholder ?? "Ja"}</span>
        </label>
      )}

      {question.type === "radio" && (
        <div className="flow-radio-group" data-testid={testId}>
          {question.options?.map((o) => (
            <label
              key={o.value}
              className={`flow-radio ${value === o.value ? "is-selected" : ""}`}
              data-testid={`${testId}-option-${o.value}`}
            >
              <input
                type="radio"
                name={id}
                value={o.value}
                checked={value === o.value}
                onChange={() => onChange(o.value)}
              />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
