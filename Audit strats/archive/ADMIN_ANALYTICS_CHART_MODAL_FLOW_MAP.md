# Admin Analytics Chart Modal — Flow map

This map documents the Admin Panel analytics “detail modal” flow:

- Open detailed chart modal from the Analytics cards
- Switch timeframe inside the modal
- Close the modal

---

## Primary file

- `app/admin-panel.tsx`
  - Owns `showDetailedChart` state and the `openDetailedChart()` handler
  - Defines the `ChartModal` component inline
  - Conditionally renders the modal

Charts rendered in the modal are from:

- `components/demo-charts` (imported into `app/admin-panel.tsx`)
  - `SalesTrendChart`
  - `BidActivityChart`
  - `UserGrowthChart`
  - `VolumeDistributionChart`

---

## State model

### AdminPanel state

- `showDetailedChart: string | null`
  - `null` → modal closed
  - non-null chart type → modal open

### ChartModal state (internal)

- `modalTimeFrame: string` (default `"7d"`)
  - Controls which timeframe is passed to the chart component in the modal

---

## Flow A — Open chart modal

### UI action

- In **Admin Panel → Analytics** tab
- Click the icon in an Analytics Card header:
  - Total Sales: `DollarSign` icon → `openDetailedChart("sales")`
  - Total Bids: `Gavel` icon → `openDetailedChart("bids")`
  - Total Volume: `TrendingUp` icon → `openDetailedChart("volume")`
  - Active Users: `Activity` icon → `openDetailedChart("users")`
  - Joined Users: `UserPlus` icon → `openDetailedChart("joined")`
  - Live Users: `Eye` icon → `openDetailedChart("live")`

### Handler chain

- `openDetailedChart(chartType)`
  - `setShowDetailedChart(chartType)`

### Render outcome

- Conditional render near the bottom of `app/admin-panel.tsx`:
  - `showDetailedChart && <ChartModal chartType={showDetailedChart} onClose={() => setShowDetailedChart(null)} />`

### Side effects

- None (state-only)

---

## Flow B — Close chart modal

### UI action

- Click the modal header X button

### Handler chain

- `ChartModal` receives `onClose`
- X button `onClick={onClose}`
- Admin panel passes `onClose={() => setShowDetailedChart(null)}`

### Outcome

- `showDetailedChart` becomes `null`
- Modal unmounts

---

## Flow C — Switch timeframe within the modal

### UI action

- Click any timeframe button in the modal (same `timeFrames` list used by the Analytics tab)

### Handler

- `onClick={() => setModalTimeFrame(frame.key)}`

### Outcome

- Chart component re-renders with `timeFrame={modalTimeFrame}`
- “Chart Stats” section re-renders, including values derived from `getAnalyticsData(modalTimeFrame)` and randomized fields

---

## Modal contents (by chartType)

### Title mapping

`getChartTitle(chartType)` maps:

- `sales` → “Sales Analytics”
- `bids` → “Bidding Activity”
- `volume` → “Trading Volume”
- `users` → “User Activity”
- `joined` → “User Growth”
- `live` → “Live Users”

### Chart rendering mapping

The modal’s “Dynamic Chart” section renders **only**:

- `sales` → `<SalesTrendChart isDark={isDark} timeFrame={modalTimeFrame} />`
- `bids` → `<BidActivityChart isDark={isDark} timeFrame={modalTimeFrame} />`
- `users` → `<UserGrowthChart isDark={isDark} timeFrame={modalTimeFrame} />`
- `volume` → `<VolumeDistributionChart isDark={isDark} timeFrame={modalTimeFrame} />`

If `chartType` is `joined` or `live`, **no chart component is rendered** (the container remains, but it is empty).

---

## DOM / storage side effects

- No `localStorage` usage
- No network calls
- DOM usage is limited to rendering a fixed overlay (`fixed inset-0`) with a centered modal

---

## Notable implementation quirks (audit notes)

- `joined` and `live` can open the modal, but the modal does not render a corresponding chart component.
- The “Chart Stats” section always uses `getAnalyticsData(modalTimeFrame).totalSales` for “Peak Value”, regardless of `chartType`.
- Several “Chart Stats” values are computed with `Math.random()`, so they change on re-render/timeframe changes.

---

## Audit checklist

- Clicking each analytics icon opens the modal with the expected title
- Timeframe button clicks update the chart props in the modal
- Close button reliably clears `showDetailedChart`
- `joined` and `live` modal behavior (empty chart area) is understood/acceptable
