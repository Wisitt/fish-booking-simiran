// utils/numericInput.ts
import { ChangeEvent } from "react";

export function numericInput(onValueChange: (value: string) => void) {
  return {
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      const sanitizedValue = event.target.value.replace(/[^0-9]/g, ""); // Allow only numbers
      onValueChange(sanitizedValue);
    },
    inputMode: "numeric", // Suggest numeric keyboard for mobile
  };
}
