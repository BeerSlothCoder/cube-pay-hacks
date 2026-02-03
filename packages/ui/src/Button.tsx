import React from "react";
import { clsx } from "clsx";
import { theme } from "./theme";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      fullWidth = false,
      loading = false,
      disabled,
      className,
      ...props
    },
    ref,
  ) => {
    const baseStyles = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: theme.fontWeight.semibold,
      borderRadius: theme.borderRadius.md,
      transition: theme.transitions.base,
      cursor: disabled || loading ? "not-allowed" : "pointer",
      opacity: disabled || loading ? 0.6 : 1,
      border: "1px solid transparent",
      width: fullWidth ? "100%" : "auto",
    };

    const variants = {
      primary: {
        backgroundColor: theme.colors.cubeBlue,
        color: theme.colors.textCream,
        ":hover": {
          backgroundColor: "#0055aa",
          boxShadow: theme.shadows.glow,
        },
      },
      secondary: {
        backgroundColor: theme.colors.accentGold,
        color: theme.colors.bgBlack,
        ":hover": {
          backgroundColor: "#ffaa00",
          boxShadow: theme.shadows.goldGlow,
        },
      },
      outline: {
        backgroundColor: "transparent",
        color: theme.colors.textCream,
        borderColor: theme.colors.border,
        ":hover": {
          borderColor: theme.colors.borderHover,
          backgroundColor: `${theme.colors.textCream}11`,
        },
      },
      ghost: {
        backgroundColor: "transparent",
        color: theme.colors.textCream,
        ":hover": {
          backgroundColor: `${theme.colors.textCream}11`,
        },
      },
    };

    const sizes = {
      sm: {
        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
        fontSize: theme.fontSize.sm,
      },
      md: {
        padding: `${theme.spacing.sm} ${theme.spacing.md}`,
        fontSize: theme.fontSize.base,
      },
      lg: {
        padding: `${theme.spacing.md} ${theme.spacing.lg}`,
        fontSize: theme.fontSize.lg,
      },
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx("cube-pay-button", className)}
        style={{
          ...baseStyles,
          ...variants[variant],
          ...sizes[size],
        }}
        {...props}
      >
        {loading && <span style={{ marginRight: theme.spacing.sm }}>⏳</span>}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
