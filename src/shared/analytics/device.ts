import type { AnalyticsEventParams } from "./types"

const BP1 = 700
const BP2 = 1450

export function getDeviceAnalyticsParams(): AnalyticsEventParams {
  if (typeof window === "undefined") {
    return {
      viewport_width: 0,
      viewport_height: 0,
      device_type: "desktop",
      breakpoint: "unknown",
    }
  }

  const width = window.innerWidth
  const height = window.innerHeight

  return {
    viewport_width: width,
    viewport_height: height,
    device_type: getDeviceType(width),
    breakpoint: getBreakpoint(width),
  }
}

function getDeviceType(width: number) {
  if (width < BP1) return "mobile"
  if (width < BP2) return "tablet"
  return "desktop"
}

function getBreakpoint(width: number) {
  if (width < BP1) return "base"
  if (width < BP2) return "bp1"
  return "bp2"
}
