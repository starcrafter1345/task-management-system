import { User } from "./types";

declare global {
  namespace Express {
    interface Locals {
      user?: User
    }
  }
}

export {};
