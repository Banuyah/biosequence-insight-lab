export default function CompositionChart({ items = [] }) {
  const max = Math.max(1, ...items.map(item => item.count))
  if (!items.length) return <p className="muted">Run an analysis to view composition.</p>
  return (
    <div className="composition-list">
      {items.map(item => (
        <div className="composition-row" key={item.symbol}>
          <span className="composition-symbol">{item.symbol}</span>
          <div className="composition-track">
            <div className="composition-fill" style={{ width: `${(item.count / max) * 100}%` }} />
          </div>
          <span className="composition-count">{item.count}</span>
        </div>
      ))}
    </div>
  )
}
