import React, { SyntheticEvent } from "react";
import cn from "classnames";
import styles from "./styles.module.css";

type Props = {
  className?: string;
  children: React.ReactNode;
  onClick: (e: SyntheticEvent) => void;
  active?: boolean;
  disabled?: boolean;
};

export const Button = ({ children, onClick, className, active, disabled }: Props) => {
  return (
    <button className={cn(styles.button, {[styles.active]: active, [styles.disabled]: disabled}, className)} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};
