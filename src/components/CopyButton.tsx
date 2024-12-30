import { useState } from "react";
import { Copy } from "@gravity-ui/icons";
import { CircleCheck } from "@gravity-ui/icons";

export function CopyButton({ onClick }: { onClick: () => void }) {
  const [isCopied, setIsCopied] = useState(false);

  const handleClick = () => {
    onClick();
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  };

  return !isCopied ? (
    <Copy onClick={handleClick} style={{ width: 10, height: 10 }} />
  ) : (
    <CircleCheck style={{ width: 10, height: 10, color: 'var(--green)' }} />
  );
}
