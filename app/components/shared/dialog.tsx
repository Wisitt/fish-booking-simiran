import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  isDestructive?: boolean;
}

export const SharedDialog: React.FC<DialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDestructive = false,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => (onCancel ? onCancel() : onOpenChange(false))}>
            {cancelText}
          </Button>
          <Button variant={isDestructive ? "destructive" : "default"} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
