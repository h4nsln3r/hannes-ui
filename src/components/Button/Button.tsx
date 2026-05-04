import React from "react";
import classNames from "classnames";
import "./button.scss";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  variant?: "solid" | "transparent";
  loading?: boolean;
};

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = "solid",
  disabled,
  loading,
  className,
  type = "button",
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={classNames("btn", `btn--${variant}`, className, {
        "btn--loading": loading,
      })}
      {...props}
    >
      {loading ? "Loading..." : label}
    </button>
  );
};
