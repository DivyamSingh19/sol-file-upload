/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
import { ExternalProvider } from '@ethersproject/providers'

declare global {
  interface Window {
    ethereum?: ExternalProvider & {
      on: (event: string, handler: (...args: any[]) => void) => void
      removeListener: (event: string, handler: (...args: any[]) => void) => void
      request: (args: { method: string; params?: any[] }) => Promise<any>
    }
  }
}

export {}