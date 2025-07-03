import React from "react";
import "./Button.css";
export type ButtonProps = {
    label: string;
    onClick?: () => void;
    variant?: "solid" | "transparent";
    disabled?: boolean;
    loading?: boolean;
    className?: string;
};
export declare const Button: React.FC<ButtonProps>;
