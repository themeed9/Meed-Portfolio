import { forwardRef, useId } from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", ...props }, ref) => {
    const errorId = useId();

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={props.id} className="block text-sm font-medium text-on-surface-variant">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={props.id}
          className={`block w-full rounded-[var(--radius-md)] border border-outline bg-surface px-4 py-2.5 text-sm text-on-surface placeholder-on-surface-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors resize-y min-h-[100px] ${
            error ? "border-error focus:border-error focus:ring-error/20" : ""
          } ${className}`}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? errorId : undefined}
          {...props}
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

Textarea.displayName = "Textarea";
export default Textarea;
