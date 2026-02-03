import React, { useEffect } from "react";
import { clsx } from "clsx";
import { theme } from "./theme";
import { Button } from "./Button";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnOverlayClick = true,
  showCloseButton = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const overlayStyles: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.overlay,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: theme.spacing.md,
  };

  const sizes = {
    sm: "400px",
    md: "600px",
    lg: "800px",
    xl: "1000px",
  };

  const modalStyles: React.CSSProperties = {
    backgroundColor: theme.colors.bgBlack,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.lg,
    width: "100%",
    maxWidth: sizes[size],
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: theme.shadows.xl,
  };

  const headerStyles: React.CSSProperties = {
    padding: theme.spacing.lg,
    borderBottom: `1px solid ${theme.colors.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };

  const titleStyles: React.CSSProperties = {
    fontSize: theme.fontSize["2xl"],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textCream,
    margin: 0,
  };

  const bodyStyles: React.CSSProperties = {
    padding: theme.spacing.lg,
    color: theme.colors.textCream,
  };

  const footerStyles: React.CSSProperties = {
    padding: theme.spacing.lg,
    borderTop: `1px solid ${theme.colors.border}`,
    display: "flex",
    gap: theme.spacing.sm,
    justifyContent: "flex-end",
  };

  const closeButtonStyles: React.CSSProperties = {
    background: "none",
    border: "none",
    color: theme.colors.textCream,
    fontSize: theme.fontSize.xl,
    cursor: "pointer",
    padding: theme.spacing.xs,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: theme.transitions.base,
  };

  return (
    <div
      style={overlayStyles}
      onClick={closeOnOverlayClick ? onClose : undefined}
      className="cube-pay-modal-overlay"
    >
      <div
        style={modalStyles}
        onClick={(e) => e.stopPropagation()}
        className="cube-pay-modal"
      >
        {(title || showCloseButton) && (
          <div style={headerStyles}>
            {title && <h2 style={titleStyles}>{title}</h2>}
            {showCloseButton && (
              <button
                onClick={onClose}
                style={closeButtonStyles}
                aria-label="Close modal"
              >
                ✕
              </button>
            )}
          </div>
        )}

        <div style={bodyStyles}>{children}</div>

        {footer && <div style={footerStyles}>{footer}</div>}
      </div>
    </div>
  );
};
