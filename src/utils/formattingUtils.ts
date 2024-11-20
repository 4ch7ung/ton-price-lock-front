import { Address } from "@ton/core";

export function shortenAddress(address: Address | string | undefined): string {
  if (!address) {
    return "";
  }

  if (typeof address !== "string") {
    address = address.toString();
  }

  if (address.length > 30) {
    return address.slice(0, 21) + "..." + address.slice(-6);
  } else {
    return address;
  };
}