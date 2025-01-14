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

export function handleNumericAnnouncementPriceChange(
  e: React.ChangeEvent<HTMLInputElement>,
  setNewAnnouncement: React.Dispatch<React.SetStateAction<any>>,
  index: number,
  newAnnouncement: any
) {
  // 1) กรองอักขระที่ไม่ใช่ตัวเลข
  const sanitizedValue = e.target.value.replace(/[^0-9]/g, "");
  // 2) แปลงเป็น Number (ถ้า "" ให้เป็น 0)
  const numericValue = sanitizedValue ? Number(sanitizedValue) : 0;

  // 3) อัปเดตฟิลด์ราคาภายใน prices
  const updatedPrices = [...newAnnouncement.prices];
  updatedPrices[index].price = numericValue;

  // 4) setState กลับ
  setNewAnnouncement({
    ...newAnnouncement,
    prices: updatedPrices,
  });
}
