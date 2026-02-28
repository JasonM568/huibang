"use client";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export default function ProgressBar({
  currentStep,
  totalSteps,
  stepTitles,
}: ProgressBarProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex justify-between">
        {stepTitles.map((title, index) => (
          <div
            key={index}
            className={`flex flex-col items-center ${
              index <= currentStep ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                index < currentStep
                  ? "bg-blue-600 text-white"
                  : index === currentStep
                  ? "bg-blue-100 text-blue-600 ring-2 ring-blue-600"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {index < currentStep ? "✓" : index + 1}
            </div>
            <span className="text-xs mt-1 hidden sm:block max-w-[80px] text-center">
              {title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
