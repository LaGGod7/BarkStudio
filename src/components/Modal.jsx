import { useEffect, useRef } from 'react';

export default function Modal({ isOpen, onClose, id, labelledBy, title, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  const handleCancel = (e) => {
    e.preventDefault();
    onClose();
  };

  const handleClick = (e) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  return (
    <dialog
      id={id}
      ref={dialogRef}
      aria-labelledby={labelledBy}
      onClick={handleClick}
      onCancel={handleCancel}
    >
      <h2 id={labelledBy}>{title}</h2>
      {children}
      <form method="dialog" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
        <button type="submit" className="btn ghost">
          Close
        </button>
      </form>
    </dialog>
  );
}
