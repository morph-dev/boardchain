import { Address } from 'viem';

export function elliptText(str: string, start = 6, end = start) {
  if (str && str.length > start + end + 1) {
    return `${str.slice(0, start)}…${str.slice(str.length - end, str.length)}`;
  }
  return str ?? '';
}

export function elliptAddress(address: Address, size = 4) {
  return elliptText(address, 2 + size, size);
}

export function bigintToString(x: bigint, asHex = true): string {
  return asHex ? `0x${x.toString(16)}` : x.toString();
}

export function parseBigint(bigintAsString: string | undefined): bigint | null {
  try {
    return bigintAsString ? BigInt(bigintAsString) : null;
  } catch (_) {
    return null;
  }
}
