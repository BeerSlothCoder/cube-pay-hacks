import React from "react";
import { clsx } from "clsx";
import { theme } from "./theme";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, helperText, fullWidth = false, className, ...props },
    ref,
  ) => {
    const inputStyles = {
      width: fullWidth ? "100%" : "auto",
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      fontSize: theme.fontSize.base,
      color: theme.colors.textCream,
      backgroundColor: `${theme.colors.bgBlack}ee`,
      border: `1px solid ${error ? theme.colors.errorRed : theme.colors.border}`,
      borderRadius: theme.borderRadius.md,
      transition: theme.transitions.base,
      outline: "none",
    };

    const containerStyles = {
      display: "flex",
      flexDirection: "column" as const,
      gap: theme.spacing.xs,
      width: fullWidth ? "100%" : "auto",
    };

    const labelStyles = {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textCream,
      fontWeight: theme.fontWeight.medium,
    };

    const helperStyles = {
      fontSize: theme.fontSize.xs,
      color: error ? theme.colors.errorRed : `${theme.colors.textCream}99`,
    };

    return (
      <div style={containerStyles}>
        {label && <label style={labelStyles}>{label}</label>}
        <input
          ref={ref}
          className={clsx("cube-pay-input", className)}
          style={inputStyles}
          {...props}
        />
        {(error || helperText) && (
          <span style={helperStyles}>{error || helperText}</span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
