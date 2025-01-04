// app/lib/inputUtils.ts

export function handleNumericInputChange(
    callback: (value: string) => void
  ): React.ChangeEventHandler<HTMLInputElement> {
    return (e) => {
      const sanitizedValue = e.target.value.replace(/[^0-9]/g, ""); // Allow only numbers
      callback(sanitizedValue);
    };
  }
  