import { SafeUser } from "./User";

declare global {
  namespace Express {
    interface Locals {
      user?: SafeUser;
    }
  }
}

export {};
