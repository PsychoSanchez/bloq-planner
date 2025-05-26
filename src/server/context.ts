import { type NextRequest } from 'next/server';

export interface Context {
  req?: NextRequest;
}

export const createContext = (opts?: { req: NextRequest }): Context => {
  return {
    req: opts?.req,
  };
};
