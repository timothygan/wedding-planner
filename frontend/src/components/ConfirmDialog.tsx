import { useEffect } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'default';
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
}: ConfirmDialogProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onCancel]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onCancel}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-graphite backdrop-blur-sm transition-all duration-300 ${
          isOpen ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
      />

      {/* Dialog */}
      <div
        className={`relative bg-ivory rounded-2xl shadow-2xl border border-old-gold max-w-md w-full transform transition-all duration-300 ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Title */}
          <h3 className="text-xl font-bold text-graphite mb-3">
            {title}
          </h3>

          {/* Message */}
          <p className="text-graphite mb-6">
            {message}
          </p>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-old-gold bg-opacity-20 text-graphite rounded-lg hover:bg-opacity-30 transition-all duration-300 border border-old-gold font-medium"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-lg transition-all duration-300 shadow-md font-medium ${
                variant === 'danger'
                  ? 'bg-cinnabar text-ivory hover:opacity-90'
                  : 'bg-forest-moss text-ivory hover:opacity-90'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

