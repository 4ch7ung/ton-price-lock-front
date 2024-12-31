// components/Modal/index.tsx
import React, { ReactNode, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import styles from "./styles.module.css";

import { Xmark } from "@gravity-ui/icons";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  title: ReactNode;
};

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, footer }) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.removeEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.container}>
        <div className={styles.header}>
          {title && <h2 className={styles.title}>{title}</h2>}
          <div className={styles.close} onClick={onClose}>
            <Xmark />
          </div>
        </div>
        <div className={styles.content}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>,
    document.body
  );
};
