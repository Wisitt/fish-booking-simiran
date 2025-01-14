type SetFormData<T> = React.Dispatch<React.SetStateAction<T>>;

export function handleNumericInputChange<T extends { dailyQuantities: Record<string, number> }>(
  e: React.ChangeEvent<HTMLInputElement>,
  setFormData: SetFormData<T>
) {
  const { name, value } = e.target;
  const sanitizedValue = value.replace(/[^0-9]/g, "");
  const day = name.replace("day-", "");

  setFormData((prev) => ({
    ...prev,
    dailyQuantities: {
      ...prev.dailyQuantities,
      [day]: sanitizedValue ? Number(sanitizedValue) : 0,
    },
  }));
}


export function handleNumericAnnouncementPriceChange<T extends { prices: { price: number }[] }>(
    e: React.ChangeEvent<HTMLInputElement>,
    setNewAnnouncement: SetFormData<T>,
    index: number,
    newAnnouncement: T
  ) {
    // 1) Filter out non-numeric characters
    const sanitizedValue = e.target.value.replace(/[^0-9]/g, "");
    // 2) Convert to a number (or 0 if empty)
    const numericValue = sanitizedValue ? Number(sanitizedValue) : 0;
  
    // 3) Update the prices array
    const updatedPrices = [...newAnnouncement.prices];
    updatedPrices[index].price = numericValue;
  
    // 4) Update the state
    setNewAnnouncement({
      ...newAnnouncement,
      prices: updatedPrices,
    });
  }
