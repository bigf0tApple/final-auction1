export type TokenKind = "NATIVE" | "ERC20"

export interface AcceptedToken {
  kind: TokenKind
  symbol: string
  address?: string // undefined for native
  decimals: number
}

export const DEFAULT_ACCEPTED_TOKEN: AcceptedToken = {
  kind: "NATIVE",
  symbol: "ETH",
  decimals: 18,
}
