import { useMemo, useState } from "react";
import type { Answers, FlowSchema } from "@/lib/flow-engine/types";
import { matchScenario, renderTemplate } from "@/lib/flow-engine/engine";
import { QuestionField } from "./QuestionField";
import { OutputPanel } from "./OutputPanel";

interface Props {
  schema: FlowSchema;
}

export function FlowRunner({ schema }: Props) {
  const [answers, setAnswers] = useState<Answers>({});

  const scenario = useMemo(() => matchScenario(schema, answers), [schema, answers]);

  const renderedText = useMemo(() => {
    const tmpl = scenario.templateOverride ?? schema.outputTemplate;
    return renderTemplate(schema, tmpl, answers);
  }, [schema, scenario, answers]);

  function setAnswer(id: string, v: string) {
    setAnswers((prev) => ({ ...prev, [id]: v }));
  }

  return (
    <div className="flow-engine-grid">
      <div className="flow-questions" data-testid="flow-questions">
        <div className="openregio-card">
          <h2>Beantwoord deze vragen</h2>
          <p className="flow-questions-intro">{schema.intro}</p>
          <div className="flow-question-list">
            {schema.questions.map((q) => (
              <QuestionField
                key={q.id}
                question={q}
                value={answers[q.id] ?? ""}
                onChange={(v) => setAnswer(q.id, v)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flow-output-col">
        <OutputPanel
          title={schema.outputTitle}
          text={renderedText}
          scenario={scenario}
        />
      </div>
    </div>
  );
}
