import React from "react";
import classNames from "classnames";
import "./button.scss";

export type ButtonProps = {
  label: string;
  onClick?: () => void;
  variant?: "solid" | "transparent";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

export const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  variant = "solid",
  disabled,
  loading,
  className,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={classNames("btn", `btn--${variant}`, className, {
        "btn--loading": loading,
      })}
    >
      {loading ? "Loading..." : label}
    </button>
  );
};
