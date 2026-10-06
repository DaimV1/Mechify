import { useState } from "react";

export type NumericFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Calculator-owned correction; no numerical rules are inferred by the input. */
  error?: string;
  /** Show an invalid restored value on mount; later edits still wait for blur. */
  validateInitially?: boolean;
};

/** Feedback begins on blur, clears on correction, and does not announce every keystroke. */
export function NumericField({
  id,
  label,
  value,
  onChange,
  error,
  validateInitially = false,
  inputClassName,
}: NumericFieldProps & { inputClassName: string }) {
  const [touched, setTouched] = useState(validateInitially && Boolean(error));
  const visibleError = touched ? error : undefined;
  const errorId = `${id}-error`;
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2 text-sm text-muted">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        value={value}
        onFocus={(event) => event.currentTarget.select()}
        onChange={(event) => onChange(event.target.value)}
        onBlur={() => setTouched(true)}
        aria-invalid={visibleError ? true : undefined}
        aria-describedby={visibleError ? errorId : undefined}
        className={inputClassName}
      />
      {visibleError ? (
        <p id={errorId} className="text-sm text-danger">
          {visibleError}
        </p>
      ) : null}
    </div>
  );
}
