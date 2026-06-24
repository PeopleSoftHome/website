declare module 'ipaddr.js' {
  export interface IPv4 {
    kind(): 'ipv4';
    toString(): string;
    match(other: IPv4 | IPv6, cidrBits: number): boolean;
  }
  export interface IPv6 {
    kind(): 'ipv6';
    toString(): string;
    match(other: IPv4 | IPv6, cidrBits: number): boolean;
  }
  export type IP = IPv4 | IPv6;
  export function parse(ip: string): IP;
  export function parseCIDR(cidr: string): [IP, number];
}
