"use client";

import { Model } from "survey-core";
import "survey-core/survey-core.min.css";
import { Survey } from "survey-react-ui";

interface SurveyFormProps {
  json: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => void;
}

export default function SurveyForm({ json, onSubmit }: SurveyFormProps) {
  const survey = new Model(json);

  survey.onComplete.add((sender) => {
    onSubmit(sender.data);
  });

  return (
    <div className="survey-container">
      <Survey model={survey} />
    </div>
  );
}
