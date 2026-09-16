const BudgetBar = ({ budget }) => {
  if (!budget) return null;

  const { total, spent, remaining, percentUsed, isOverBudget } = budget;

  const clampedPercent = Math.min(percentUsed || 0, 100);
  const fillClass = isOverBudget ? 'over' : percentUsed >= 80 ? 'warning' : 'safe';

  const fmt = (n) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n || 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
          Budget Used: {percentUsed || 0}%
        </span>
        <span style={{ fontSize: '0.82rem', color: isOverBudget ? 'var(--color-rose-400)' : 'var(--color-teal-400)', fontWeight: 600 }}>
          {isOverBudget ? `Over by ${fmt(Math.abs(remaining))}` : `${fmt(remaining)} remaining`}
        </span>
      </div>

      <div className="budget-bar-track">
        <div
          className={`budget-bar-fill ${fillClass}`}
          style={{ width: `${clampedPercent}%` }}
        />
      </div>

      <div className="budget-stats">
        <div className="budget-stat">
          <div className="budget-stat-value" style={{ color: 'var(--color-teal-400)' }}>{fmt(total)}</div>
          <div className="budget-stat-label">Total Budget</div>
        </div>
        <div className="budget-stat">
          <div className="budget-stat-value" style={{ color: isOverBudget ? 'var(--color-rose-400)' : 'var(--color-amber-400)' }}>
            {fmt(spent)}
          </div>
          <div className="budget-stat-label">Planned Spend</div>
        </div>
        <div className="budget-stat">
          <div className="budget-stat-value" style={{ color: isOverBudget ? 'var(--color-rose-400)' : 'var(--color-teal-400)' }}>
            {fmt(remaining)}
          </div>
          <div className="budget-stat-label">Remaining</div>
        </div>
      </div>
    </div>
  );
};

export default BudgetBar;
