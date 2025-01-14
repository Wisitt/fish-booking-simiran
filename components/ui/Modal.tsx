"use client";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

interface ModalHeaderProps {
  children: React.ReactNode;
}

interface ModalBodyProps {
  children: React.ReactNode;
}

interface ModalFooterProps {
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div 
        className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-blue-100/40"
        role="dialog"
        aria-modal="true"
      >
        <div 
          className="bg-white rounded-2xl max-w-3xl w-full h-[90vh] flex flex-col shadow-2xl transform transition-all animate-modal"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </>
  );
}

export function ModalHeader({ children }: ModalHeaderProps) {
  return (
    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between z-10 rounded-t-2xl bg-gradient-to-br from-sky-50 via-white to-sky-100 border-black	 border-b  	">
      {children}
    </div>
  );
}

export function ModalBody({ children }: ModalBodyProps) {
  return (
    <div className="flex-1 px-6 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
      {children}
    </div>
  );
}

export function ModalFooter({ children }: ModalFooterProps) {
  return (
    <div className="px-6 py-4 border-t border-gray-200 bg-gray-200 rounded-b-2xl border-black border-t">
      {children}
    </div>
  );
}
