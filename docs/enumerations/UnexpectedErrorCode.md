[**always-panic v0.8.3**](../README.md)

***

[always-panic](../globals.md) / UnexpectedErrorCode

# Enumeration: UnexpectedErrorCode

Defined in: [src/error/error.ts:3](https://github.com/xkatianx/always-panic/blob/76703c0987dff44a1a82536ea874cdfe24a2610a/src/error/error.ts#L3)

## Enumeration Members

### UNKNOWN

> **UNKNOWN**: `0`

Defined in: [src/error/error.ts:5](https://github.com/xkatianx/always-panic/blob/76703c0987dff44a1a82536ea874cdfe24a2610a/src/error/error.ts#L5)

Foreign or unknown failure — promote to a `TypedError` when recognized.

***

### UNREACHABLE

> **UNREACHABLE**: `1`

Defined in: [src/error/error.ts:7](https://github.com/xkatianx/always-panic/blob/76703c0987dff44a1a82536ea874cdfe24a2610a/src/error/error.ts#L7)

Branch that should never run (bug in caller or logic).
