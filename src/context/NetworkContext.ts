import { createContext } from "react";
import { Network } from "@orbs-network/ton-access";

const urlParams = new URLSearchParams(window.location.search);
const networkParam = urlParams.get("network");
const network: Network = networkParam === "testnet" ? "testnet" : "mainnet";

export const NetworkContext = createContext<Network>(network);