"use client"

import { useEffect } from "react"

/**
 * Prevent “Cannot redefine property: ethereum” runtime errors that occur
 * when a script or extension tries to redefine `window.ethereum`.
 *
 * This wrapper is installed once on mount and then removed from the tree.
 */
export default function EthereumFix() {
  useEffect(() => {
    // Only run in a real browser environment
    if (typeof window === "undefined") return

    // Save the genuine implementation
    const originalDefineProperty = Object.defineProperty

    // Patch defineProperty
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    Object.defineProperty = (target: object, property: PropertyKey, descriptor: PropertyDescriptor) => {
      // If someone tries to redefine window.ethereum and it already exists,
      // quietly ignore the attempt to avoid the fatal TypeError.
      if (target === window && property === "ethereum" && Object.prototype.hasOwnProperty.call(target, "ethereum")) {
        return target
      }

      // Otherwise, proceed as normal.
      return originalDefineProperty.call(Object, target, property, descriptor)
    }

    // Clean-up on unmount to restore original behavior (rarely necessary here)
    return () => {
      Object.defineProperty = originalDefineProperty
    }
  }, [])

  return null
}
