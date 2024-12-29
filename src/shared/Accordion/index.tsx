import React, { useState } from "react";
import { ChevronDown } from "@gravity-ui/icons";
import styles from "./styles.module.css";

type AccordionProps = {
  title: string;
  open?: boolean;
  children: React.ReactNode;
};

export const Accordion: React.FC<AccordionProps> = ({ title, children, open = true }) => {
  const [isOpen, setIsOpen] = useState(open);

  const toggleAccordion = () => setIsOpen((prev) => !prev);

  return (
    <div className={styles.accordion}>
      <div className={styles.header} onClick={toggleAccordion}>
        <span>{title}</span>
        <span className={`${styles.arrow} ${!isOpen ? styles.open : ""}`}>
          <ChevronDown />
        </span>
      </div>
      {isOpen && <div className={styles.content}>{children}</div>}
    </div>
  );
};
