import { User } from "./User";

declare global {
  namespace Express {
    interface Locals {
      user?: User
    }
  }
}

export {};
