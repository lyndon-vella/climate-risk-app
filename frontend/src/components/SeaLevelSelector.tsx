interface SeaLevelSelectorProps {
  value: number
  onChange: (value: number) => void
}

const SEA_LEVELS = [1, 2, 3, 4, 5, 8, 15, 25, 40, 70]

export default function SeaLevelSelector({ value, onChange }: SeaLevelSelectorProps) {
  return (
    <div className="form-group">
      <label>Sea Level Rise Scenario</label>
      <div className="sea-level-buttons">
        {SEA_LEVELS.map((level) => (
          <button
            key={level}
            className={`sea-level-btn ${value === level ? `active level-${level}` : ''}`}
            onClick={() => onChange(level)}
          >
            {level}m
          </button>
        ))}
      </div>
      <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#718096' }}>
        {getScenarioDescription(value)}
      </div>
    </div>
  )
}

function getScenarioDescription(level: number): string {
  switch (level) {
    case 1:
      return 'Projected by 2100 under moderate emissions (RCP 4.5)'
    case 2:
      return 'Projected by 2100 under high emissions (RCP 8.5)'
    case 3:
      return 'Possible with accelerated ice sheet collapse'
    case 4:
      return 'Extreme scenario - major ice sheet instability'
    case 5:
      return 'Catastrophic scenario - complete Greenland ice sheet melt'
    case 8:
      return 'Worst case - Greenland + West Antarctic ice sheet collapse'
    case 15:
      return 'Complete West Antarctic + partial East Antarctic melt'
    case 25:
      return 'Major Antarctic ice sheet collapse'
    case 40:
      return 'Near-complete Antarctic melt (multi-century timescale)'
    case 70:
      return 'Total ice sheet melt - all ice on Earth (theoretical maximum)'
    default:
      return ''
  }
}
