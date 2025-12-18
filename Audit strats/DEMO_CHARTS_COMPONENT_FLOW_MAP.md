# DEMO CHARTS (COMPONENT) FLOW MAP

Scope:
- Demo chart components: `components/demo-charts.tsx`

Mounted/consumed from:
- `app/admin-panel.tsx` (Admin Analytics)

Related docs:
- System/feature map: `DEMO_CHARTS_FLOW_MAP.md`
- Admin analytics modal wiring: `ADMIN_ANALYTICS_CHART_MODAL_FLOW_MAP.md`

---

## Purpose

- Provide small, self-contained chart components for the Admin Analytics UI.
- Provide demo-only datasets that change based on a `timeFrame` selector.

---

## Public API

File: `components/demo-charts.tsx` (client module via `"use client"`).

Exports (named):
- `SalesTrendChart({ isDark, timeFrame })`
- `BidActivityChart({ isDark, timeFrame })`
- `UserGrowthChart({ isDark, timeFrame })`
- `VolumeDistributionChart({ isDark, timeFrame })`

Shared props interface:
- `isDark: boolean`
- `timeFrame: string`

---

## Internal helpers (demo datasets)

All generator helpers:
- Use a fixed, hard-coded `baseData` map keyed by `timeFrame`.
- Fallback to `baseData["7d"]` for unknown `timeFrame` values.

### `generateSalesData(timeFrame)`
- Returns `Array<{ name: string; sales: number }>`.
- Supported keys: `"7d" | "1m" | "3m" | "6m" | "1y" | "all"`.

### `generateBidData(timeFrame)`
- Returns `Array<{ name: string; bids: number }>`.
- Supported keys: `"7d" | "1m" | "3m" | "6m" | "1y" | "all"`.

### `generateUserGrowthData(timeFrame)`
- Returns `Array<{ name: string; users: number }>`.
- Supported keys: `"7d" | "1m" | "3m" | "6m" | "1y" | "all"`.

### `generateVolumeData(timeFrame)`
- Returns `Array<{ name: string; value: number; color: string }>`.
- Includes per-slice `color` values as hard-coded hex strings.

---

## Rendering composition (Recharts)

Imports:
- Recharts primitives: `ResponsiveContainer`, `LineChart`, `BarChart`, `PieChart`, `CartesianGrid`, `XAxis`, `YAxis`, `Tooltip`, and element primitives (`Line`, `Bar`, `Pie`, `Cell`).

Common structure:
- Each component computes its dataset from `timeFrame`.
- Wraps the chart in `ResponsiveContainer width="100%" height={200}`.

---

## Theme behavior (`isDark`)

Shared visual rules (used by all 4 charts):
- Grid stroke: dark `#374151`, light `#E5E7EB`.
- Axis tick/line stroke: dark `#9CA3AF`, light `#6B7280`.
- Tooltip `contentStyle`:
  - dark: black background + white border/text
  - light: white background + black border/text

Chart element coloring:
- `SalesTrendChart`: line + dots are white (dark) / black (light).
- `BidActivityChart`: bars are white (dark) / black (light).
- `UserGrowthChart`: line + dots are white (dark) / black (light).
- `VolumeDistributionChart`: slice fill uses `entry.color` regardless of `isDark`.

---

## Component-specific behavior

### `SalesTrendChart`
- Uses `LineChart`.
- `Line`:
  - `type="monotone"`
  - `dataKey="sales"`
  - `strokeWidth={2}`

### `BidActivityChart`
- Uses `BarChart`.
- `Bar`:
  - `dataKey="bids"`

### `UserGrowthChart`
- Uses `LineChart`.
- `Line`:
  - `type="monotone"`
  - `dataKey="users"`
  - `strokeWidth={2}`

### `VolumeDistributionChart`
- Uses `PieChart` + `Pie`.
- `Pie`:
  - `data={volumeData}`
  - `outerRadius={60}`
  - `dataKey="value"`
  - `label`: `${name} ${((percent || 0) * 100).toFixed(0)}%` (0-decimal percent)
- Slice coloring:
  - Maps `volumeData` and renders `<Cell fill={entry.color} />`.

---

## Side effects

- No network calls.
- No `localStorage` usage.
- No timers/intervals.
- No mutation of global DOM/classes.

These components are “pure render” with in-module demo dataset constants.

---

## Consumer wiring notes

In `app/admin-panel.tsx`:
- Imports: `SalesTrendChart`, `BidActivityChart`, `UserGrowthChart`, `VolumeDistributionChart` from `../components/demo-charts`.
- The Admin Panel owns the active `selectedTimeFrame` state and passes `timeFrame` into the chart components.

---

## Audit checklist

- Confirm the Admin time-frame values match the generator keys (`"7d" | "1m" | "3m" | "6m" | "1y" | "all"`).
- Confirm the hard-coded hex colors (especially `generateVolumeData`) are acceptable under the design system constraints.
- If/when replacing demo analytics with real analytics, swap generators for a real data source and define a typed `timeFrame` union to avoid silent fallback.
