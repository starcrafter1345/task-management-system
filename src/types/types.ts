import { Request } from "express";

export interface ResponseToken {
  access_token: string;
}

export interface CookieRequest extends Request {
  cookies: {
    refresh_token?: string;
  };
}
