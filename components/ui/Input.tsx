import { forwardRef, useId } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    const errorId = useId();
    // Generated id so the label is always tied to its field, even when callers pass none.
    const autoId = useId();
    const fieldId = props.id ?? autoId;

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={fieldId} className="block text-sm font-medium text-on-surface-variant">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`block w-full rounded-[var(--radius-md)] border border-outline bg-surface px-4 py-2.5 text-sm text-on-surface placeholder-on-surface-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors ${
            error ? "border-error focus:border-error focus:ring-error/20" : ""
          } ${className}`}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? errorId : undefined}
          {...props}
          id={fieldId}
        />
        {error && (
          <p id={errorId} className="text-sm text-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
