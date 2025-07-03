import { jsx as _jsx } from "react/jsx-runtime";
import classNames from "classnames";
import "./Button.css";
export const Button = ({ label, onClick, variant = "solid", disabled, loading, className, }) => {
    return (_jsx("button", { onClick: onClick, disabled: disabled || loading, className: classNames("btn", `btn--${variant}`, className, {
            "btn--loading": loading,
        }), children: loading ? "Loading..." : label }));
};
