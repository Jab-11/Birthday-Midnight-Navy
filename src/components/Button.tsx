import type { ButtonHTMLAttributes } from "react";

import styles from "./Button.module.css";

type Variant = "gold" | "ghost" | "ink";

export function Button({
  variant = "gold",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const cls = [styles.button, variant !== "gold" ? styles[variant] : "", className ?? ""].join(" ");
  return <button type="button" className={cls} {...props} />;
}

/** The chapter Next control; only rendered once that chapter's main action is done (F-05). */
export function NextButton({
  onClick,
  label = "Next",
  variant = "gold",
}: {
  onClick: () => void;
  label?: string;
  variant?: Variant;
}) {
  return (
    <Button variant={variant} onClick={onClick} className={styles.next}>
      {label}
      <span className={styles.arrow} aria-hidden="true">
        →
      </span>
    </Button>
  );
}
