"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  id: number
  name: string
}

interface ProgressIndicatorProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (stepId: number) => void
}

export function ProgressIndicator({ steps, currentStep, onStepClick }: ProgressIndicatorProps) {
  return (
    <nav aria-label="Booking progress" className="mx-auto max-w-2xl">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep
          const isCurrent = step.id === currentStep
          const isClickable = isCompleted && onStepClick

          return (
            <li key={step.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-all",
                    isCompleted && "border-primary bg-primary text-primary-foreground",
                    isCurrent && "border-primary bg-background text-primary",
                    !isCompleted && !isCurrent && "border-muted bg-muted text-muted-foreground",
                    isClickable && "cursor-pointer hover:scale-110 hover:shadow-md",
                    !isClickable && "cursor-default",
                  )}
                  aria-label={isClickable ? `Go back to ${step.name}` : undefined}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : step.id}
                </button>
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    "text-xs font-medium transition-colors",
                    isCurrent ? "text-foreground" : "text-muted-foreground",
                    isClickable && "cursor-pointer hover:text-primary hover:underline",
                    !isClickable && "cursor-default",
                  )}
                >
                  {step.name}
                </button>
              </div>
              {index < steps.length - 1 && (
                <div className={cn("mx-2 h-0.5 flex-1 transition-colors", isCompleted ? "bg-primary" : "bg-muted")} />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
