"use client";

import { FC } from "react";
import CreatableSelect, {
  CreatableProps,
} from "react-select/creatable";
import { GroupBase } from "react-select";

// สร้าง Interface ของ Option
export interface SelectOption {
  value: string;
  label: string;
}

// นิยาม Props ที่รองรับการสร้างออปชันแบบ Single Select (ไม่ใช่ multi)
type Props = CreatableProps<SelectOption, false, GroupBase<SelectOption>>;

// สร้างคอมโพเนนต์ที่รับ Props ตรงตาม CreatableProps
const CreatableSelectNoSSR: FC<Props> = (props) => {
  return <CreatableSelect {...props} />;
};

export default CreatableSelectNoSSR;
