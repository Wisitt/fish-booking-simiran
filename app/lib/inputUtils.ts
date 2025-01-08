// app/lib/inputUtils.ts
export function handleNumericInputChange(
  e: React.ChangeEvent<HTMLInputElement>,
  setFormData: React.Dispatch<React.SetStateAction<any>>
) {
  const { name, value } = e.target;
  const sanitizedValue = value.replace(/[^0-9]/g, "");
  const day = name.replace("day-", "");
  
  setFormData((prev: any) => ({
    ...prev,
    dailyQuantities: {
      ...prev.dailyQuantities,
      [day]: sanitizedValue ? Number(sanitizedValue) : 0
    }
  }));
}
