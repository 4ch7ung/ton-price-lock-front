import { createContext } from "react";
import { Network } from "../utils/types";

export const NetworkContext = createContext<Network>("testnet");