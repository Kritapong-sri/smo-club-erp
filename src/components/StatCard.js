export default function StatCard({ title, value, icon, change, isPositive, color }) {
  return (
    <div className="stat-card">
      <div 
        className="stat-icon" 
        style={{ 
          backgroundColor: `${color}20`,
          color: color,
        }}
      >
        {icon}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{title}</div>
      {change && (
        <div className={`stat-change ${isPositive ? 'up' : 'down'}`}>
          {isPositive ? '↑' : '↓'} {change}
        </div>
      )}
    </div>
  );
}
