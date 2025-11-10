import * as React from "react"
import { cn } from "../../lib/utils"

const RadioGroupContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
} | null>(null)

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, defaultValue, children, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || "")

    const currentValue = value !== undefined ? value : internalValue
    const handleValueChange = (newValue: string) => {
      if (value === undefined) {
        setInternalValue(newValue)
      }
      onValueChange?.(newValue)
    }

    return (
      <RadioGroupContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
        <div ref={ref} className={cn("grid gap-2", className)} {...props}>
          {children}
        </div>
      </RadioGroupContext.Provider>
    )
  }
)
RadioGroup.displayName = "RadioGroup"

interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string
  id?: string
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, id, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext)
    if (!context) {
      throw new Error("RadioGroupItem must be used within a RadioGroup")
    }

    const itemId = id || `radio-${value}`
    const isChecked = context.value === value

    return (
      <div className="flex items-center">
        <input
          type="radio"
          ref={ref}
          id={itemId}
          value={value}
          checked={isChecked}
          onChange={() => context.onValueChange(value)}
          className={cn(
            "h-4 w-4 rounded-full border border-gray-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2",
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
