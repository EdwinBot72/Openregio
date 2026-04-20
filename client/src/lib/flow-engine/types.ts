export type RiskLevel = "laag" | "midden" | "hoog";

export type QuestionType = "radio" | "select" | "text" | "textarea" | "date" | "checkbox";

export interface QuestionOption {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  help?: string;
  placeholder?: string;
  required?: boolean;
  options?: QuestionOption[];
}

export type AnswerValue = string;
export type Answers = Record<string, AnswerValue>;

export interface ScenarioCondition {
  questionId: string;
  equals?: AnswerValue;
  in?: AnswerValue[];
  contains?: string;
  minLength?: number;
}

export interface Scenario {
  id: string;
  level: RiskLevel;
  riskLabel: string;
  when: ScenarioCondition[];
  checks: string[];
  nextStep: string;
  templateOverride?: string;
}

export interface FlowSchema {
  id: string;
  title: string;
  intro: string;
  icon: "mail" | "help" | "shield";
  questions: Question[];
  outputTitle: string;
  outputTemplate: string;
  scenarios: Scenario[];
  fallbackScenario: Omit<Scenario, "when" | "id">;
}
