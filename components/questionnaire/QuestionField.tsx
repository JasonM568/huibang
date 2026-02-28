"use client";

import { Question, QuestionnaireAnswers } from "@/lib/questionnaire-data";

interface QuestionFieldProps {
  question: Question;
  answers: QuestionnaireAnswers;
  onChange: (id: string, value: string | string[]) => void;
  error?: string;
}

export default function QuestionField({
  question,
  answers,
  onChange,
  error,
}: QuestionFieldProps) {
  const value = answers[question.id] || "";

  const baseInputClass =
    "w-full px-4 py-3 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const inputClass = `${baseInputClass} ${
    error ? "border-red-300 bg-red-50" : "border-gray-300 bg-white hover:border-gray-400"
  }`;

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {question.label}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {question.helpText && (
        <p className="text-xs text-gray-500 mb-2">{question.helpText}</p>
      )}

      {/* Text input */}
      {(question.type === "text" || question.type === "email" || question.type === "url") && (
        <input
          type={question.type}
          value={value as string}
          onChange={(e) => onChange(question.id, e.target.value)}
          placeholder={question.placeholder}
          className={inputClass}
        />
      )}

      {/* Textarea */}
      {question.type === "textarea" && (
        <textarea
          value={value as string}
          onChange={(e) => onChange(question.id, e.target.value)}
          placeholder={question.placeholder}
          rows={3}
          className={`${inputClass} resize-none`}
        />
      )}

      {/* Select dropdown */}
      {question.type === "select" && (
        <select
          value={value as string}
          onChange={(e) => onChange(question.id, e.target.value)}
          className={inputClass}
        >
          <option value="">請選擇</option>
          {question.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {/* Radio buttons */}
      {question.type === "radio" && (
        <div className="space-y-2">
          {question.options?.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                value === opt.value
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name={question.id}
                value={opt.value}
                checked={value === opt.value}
                onChange={(e) => onChange(question.id, e.target.value)}
                className="sr-only"
              />
              <div
                className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center flex-shrink-0 ${
                  value === opt.value ? "border-blue-500" : "border-gray-300"
                }`}
              >
                {value === opt.value && (
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                )}
              </div>
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      )}

      {/* Checkboxes */}
      {question.type === "checkbox" && (
        <div className="space-y-2">
          {question.options?.map((opt) => {
            const selectedValues = (value as string[]) || [];
            const isChecked = selectedValues.includes(opt.value);

            return (
              <label
                key={opt.value}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  isChecked
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  value={opt.value}
                  checked={isChecked}
                  onChange={() => {
                    const newValues = isChecked
                      ? selectedValues.filter((v) => v !== opt.value)
                      : [...selectedValues, opt.value];
                    onChange(question.id, newValues);
                  }}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center flex-shrink-0 ${
                    isChecked
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {isChecked && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12">
                      <path
                        d="M10 3L4.5 8.5L2 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-sm">{opt.label}</span>
              </label>
            );
          })}
        </div>
      )}

      {/* Error message */}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
