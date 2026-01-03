interface RiskAssessmentProps {
  elevation: number
  seaLevelRise: number
}

type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

interface RiskResult {
  level: RiskLevel
  title: string
  description: string
  advice: string[]
}

export default function RiskAssessment({ elevation, seaLevelRise }: RiskAssessmentProps) {
  const risk = calculateRisk(elevation, seaLevelRise)

  return (
    <div className="risk-assessment">
      <div className="risk-header">
        <h3>Risk Assessment</h3>
        <span className={`risk-badge ${risk.level}`}>
          {risk.title}
        </span>
      </div>

      <div className="risk-details">
        <p>{risk.description}</p>

        <h4 style={{ marginTop: '15px', marginBottom: '10px' }}>Recommendations</h4>
        <ul className="advice-list">
          {risk.advice.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: '20px', padding: '10px', background: '#edf2f7', borderRadius: '8px', fontSize: '0.8rem' }}>
        <strong>Key Metrics:</strong>
        <div style={{ marginTop: '5px' }}>
          Property elevation: {elevation.toFixed(1)}m |
          Sea level rise: +{seaLevelRise}m |
          Buffer: {(elevation - seaLevelRise).toFixed(1)}m
        </div>
      </div>
    </div>
  )
}

function calculateRisk(elevation: number, seaLevelRise: number): RiskResult {
  const buffer = elevation - seaLevelRise

  // Critical: Property would be below sea level
  if (buffer < 0) {
    return {
      level: 'critical',
      title: 'Critical Risk',
      description: `With ${seaLevelRise}m of sea level rise, this property would be ${Math.abs(buffer).toFixed(1)}m below the new sea level. Permanent inundation is highly likely without significant flood defenses.`,
      advice: [
        'Consider relocating to higher ground if possible',
        'Consult with local authorities about flood protection infrastructure',
        'Investigate property buyout or managed retreat programs',
        'Ensure comprehensive flood insurance coverage',
        'Develop an emergency evacuation plan',
        'Monitor local climate adaptation planning efforts'
      ]
    }
  }

  // High: Very little buffer (0-2m above projected sea level)
  if (buffer < 2) {
    return {
      level: 'high',
      title: 'High Risk',
      description: `With ${seaLevelRise}m of sea level rise, this property would only be ${buffer.toFixed(1)}m above sea level. High risk of flooding during storm surges and high tides.`,
      advice: [
        'Install flood barriers and water-resistant building materials',
        'Raise electrical systems and HVAC above potential flood levels',
        'Obtain comprehensive flood insurance',
        'Create an emergency kit and evacuation plan',
        'Consider elevating the structure if feasible',
        'Install sump pumps and backflow valves'
      ]
    }
  }

  // Medium: Moderate buffer (2-5m)
  if (buffer < 5) {
    return {
      level: 'medium',
      title: 'Medium Risk',
      description: `With ${seaLevelRise}m of sea level rise, this property would be ${buffer.toFixed(1)}m above sea level. Moderate risk during extreme weather events and storm surges.`,
      advice: [
        'Consider flood insurance for storm surge protection',
        'Install basic flood-proofing measures',
        'Keep important documents in waterproof containers',
        'Know your evacuation routes',
        'Stay informed about local flood warning systems',
        'Maintain property drainage systems'
      ]
    }
  }

  // Low: Good buffer (5m+)
  return {
    level: 'low',
    title: 'Low Risk',
    description: `With ${seaLevelRise}m of sea level rise, this property would remain ${buffer.toFixed(1)}m above sea level. Low direct flood risk, though indirect effects may still occur.`,
    advice: [
      'Stay informed about regional climate adaptation plans',
      'Consider how sea level rise may affect local infrastructure',
      'Basic emergency preparedness is still recommended',
      'Monitor changes in local flood zone designations',
      'Be aware of potential impacts on property values in affected areas'
    ]
  }
}
