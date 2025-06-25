import { type SimulationParameters, type SimulationOutcomes } from "@shared/schema";

// Base emission values (in GtCO2e per year)
const GLOBAL_EMISSIONS_BASELINE = 45; // Global emissions baseline
const RENEWABLE_EFFICIENCY_FACTOR = 0.85; // How efficiently renewables replace fossil fuels
const POLICY_MULTIPLIERS = {
  low: 1.0,
  moderate: 1.2,
  high: 1.5,
  maximum: 2.0
};

// Economic factors
const SOLAR_COST_PER_PERCENT = 50; // Billion USD per 1% global adoption
const WIND_COST_PER_PERCENT = 40; // Billion USD per 1% global adoption
const POLICY_COST_MULTIPLIER = 0.3; // Additional cost for policy implementation

// Climate sensitivity parameters
const CLIMATE_SENSITIVITY = 3.0; // °C per CO2 doubling
const CO2_TO_TEMP_FACTOR = 0.0015; // Simplified temperature change per GtCO2e

export function runSimulation(challenge: string, parameters: SimulationParameters): SimulationOutcomes {
  switch (challenge) {
    case 'reduce_emissions':
      return simulateEmissionReduction(parameters);
    case 'reforestation':
      return simulateReforestation(parameters);
    default:
      return simulateEmissionReduction(parameters);
  }
}

function simulateEmissionReduction(parameters: SimulationParameters): SimulationOutcomes {
  const { solarEnergyAdoption, windEnergyAdoption, policyStrength } = parameters;
  
  // Calculate renewable energy impact
  const totalRenewableAdoption = solarEnergyAdoption + windEnergyAdoption;
  const policyMultiplier = POLICY_MULTIPLIERS[policyStrength];
  
  // Calculate CO2 reduction
  const maxPossibleReduction = 65; // Maximum realistic reduction percentage
  const renewableContribution = (totalRenewableAdoption / 200) * maxPossibleReduction; // Normalized to 100%
  const policyBonus = (policyMultiplier - 1) * 10; // Policy adds 0-10% additional reduction
  const co2Reduction = Math.min(maxPossibleReduction, renewableContribution + policyBonus);
  
  // Calculate temperature impact
  const emissionReduction = GLOBAL_EMISSIONS_BASELINE * (co2Reduction / 100);
  const temperatureChange = 2.2 - (emissionReduction * CO2_TO_TEMP_FACTOR * 10); // Start from 2.2°C trajectory
  
  // Calculate economic costs
  const solarCost = solarEnergyAdoption * SOLAR_COST_PER_PERCENT;
  const windCost = windEnergyAdoption * WIND_COST_PER_PERCENT;
  const policyCost = (solarCost + windCost) * POLICY_COST_MULTIPLIER * (policyMultiplier - 1);
  const totalCost = solarCost + windCost + policyCost;
  
  // Calculate ROI (simplified)
  const avoidedClimateCosts = co2Reduction * 100; // Billion USD saved per % reduction
  const roi = (avoidedClimateCosts / totalCost) * 100;
  
  // Calculate feasibility score
  const feasibilityScore = calculateFeasibilityScore(solarEnergyAdoption, windEnergyAdoption, policyStrength);
  
  // Calculate sustainability score
  const sustainabilityScore = calculateSustainabilityScore(totalRenewableAdoption, temperatureChange);
  
  // Calculate global impact score
  const globalImpactScore = calculateGlobalImpactScore(co2Reduction, temperatureChange, feasibilityScore);
  
  return {
    temperatureChange: Math.max(1.5, temperatureChange), // Minimum 1.5°C (Paris Agreement goal)
    co2Reduction,
    economicImpact: totalCost,
    roi: Math.max(0, roi),
    feasibilityScore,
    sustainabilityScore,
    globalImpactScore
  };
}

function simulateReforestation(parameters: SimulationParameters): SimulationOutcomes {
  // Simplified reforestation model
  const { solarEnergyAdoption, windEnergyAdoption, policyStrength } = parameters;
  const policyMultiplier = POLICY_MULTIPLIERS[policyStrength];
  
  // Reforestation absorbs CO2 but at lower rates than renewable energy prevents emissions
  const reforestationEffectiveness = 0.6; // 60% as effective as emission reduction
  const totalEnviroAction = (solarEnergyAdoption + windEnergyAdoption) * reforestationEffectiveness;
  const co2Reduction = (totalEnviroAction / 200) * 40 * policyMultiplier; // Max 40% reduction via reforestation
  
  const temperatureChange = 2.1 - (co2Reduction * CO2_TO_TEMP_FACTOR * 8);
  const economicImpact = totalEnviroAction * 20; // Lower cost per unit for reforestation
  const roi = (co2Reduction * 80) / economicImpact * 100; // Different ROI calculation
  
  const feasibilityScore = calculateFeasibilityScore(solarEnergyAdoption, windEnergyAdoption, policyStrength, 'reforestation');
  const sustainabilityScore = Math.min(100, calculateSustainabilityScore(totalEnviroAction, temperatureChange) + 15); // Bonus for ecosystem benefits
  const globalImpactScore = calculateGlobalImpactScore(co2Reduction, temperatureChange, feasibilityScore);
  
  return {
    temperatureChange: Math.max(1.5, temperatureChange),
    co2Reduction,
    economicImpact,
    roi: Math.max(0, roi),
    feasibilityScore,
    sustainabilityScore,
    globalImpactScore
  };
}

function calculateFeasibilityScore(solar: number, wind: number, policy: string, challenge: string = 'reduce_emissions'): number {
  let baseScore = 80; // Start with high feasibility
  
  // Penalize for very high adoption rates (harder to achieve)
  if (solar > 80) baseScore -= (solar - 80) * 0.5;
  if (wind > 80) baseScore -= (wind - 80) * 0.5;
  
  // Policy strength affects feasibility
  const policyImpact = {
    low: 5,      // Easy to implement
    moderate: 0,  // Neutral
    high: -10,   // Harder politically
    maximum: -20 // Very difficult
  };
  baseScore += policyImpact[policy as keyof typeof policyImpact];
  
  // Balance bonus: If renewable mix is balanced, it's more feasible
  const balance = Math.abs(solar - wind);
  if (balance < 20) baseScore += 10; // Bonus for balanced approach
  
  // Challenge-specific adjustments
  if (challenge === 'reforestation') {
    baseScore += 5; // Generally more feasible
  }
  
  return Math.max(20, Math.min(100, baseScore));
}

function calculateSustainabilityScore(renewableTotal: number, temperatureChange: number): number {
  let baseScore = 50;
  
  // Higher renewable adoption = higher sustainability
  baseScore += (renewableTotal / 200) * 40; // Up to +40 points
  
  // Better temperature outcomes = higher sustainability
  if (temperatureChange <= 1.5) baseScore += 30;
  else if (temperatureChange <= 2.0) baseScore += 20;
  else if (temperatureChange <= 2.5) baseScore += 10;
  // No bonus above 2.5°C
  
  // Penalize for imbalanced approaches
  if (renewableTotal < 50) baseScore -= 15; // Too little action
  if (renewableTotal > 180) baseScore -= 10; // Potentially unrealistic
  
  return Math.max(10, Math.min(100, baseScore));
}

function calculateGlobalImpactScore(co2Reduction: number, temperatureChange: number, feasibilityScore: number): number {
  let baseScore = 40;
  
  // CO2 reduction impact
  baseScore += (co2Reduction / 65) * 35; // Up to +35 points for max reduction
  
  // Temperature target achievement
  if (temperatureChange <= 1.5) baseScore += 20; // Paris Agreement 1.5°C goal
  else if (temperatureChange <= 2.0) baseScore += 10; // Paris Agreement 2°C goal
  
  // Feasibility factor (feasible solutions have higher global impact potential)
  baseScore += (feasibilityScore / 100) * 15;
  
  return Math.max(15, Math.min(100, baseScore));
}

// Helper function to calculate synergy between different parameters
export function calculateParameterSynergy(parameters: SimulationParameters): number {
  const { solarEnergyAdoption, windEnergyAdoption, policyStrength } = parameters;
  
  let synergyScore = 60; // Base synergy
  
  // Balance between solar and wind (diversification bonus)
  const balance = Math.abs(solarEnergyAdoption - windEnergyAdoption);
  if (balance < 15) synergyScore += 15; // High synergy for balanced approach
  else if (balance < 30) synergyScore += 8;
  else if (balance < 50) synergyScore += 3;
  
  // Policy alignment with renewable goals
  const totalRenewables = solarEnergyAdoption + windEnergyAdoption;
  const policyLevel = POLICY_MULTIPLIERS[policyStrength];
  
  if (totalRenewables > 120 && policyLevel >= 1.5) {
    synergyScore += 20; // High synergy: ambitious renewables + strong policy
  } else if (totalRenewables > 80 && policyLevel >= 1.2) {
    synergyScore += 12; // Good synergy: moderate renewables + adequate policy
  } else if (totalRenewables < 60 && policyLevel <= 1.0) {
    synergyScore -= 10; // Poor synergy: low renewables + weak policy
  }
  
  // Penalize for extreme values
  if (solarEnergyAdoption > 90 || windEnergyAdoption > 90) synergyScore -= 8;
  if (solarEnergyAdoption < 10 && windEnergyAdoption < 10) synergyScore -= 15;
  
  return Math.max(20, Math.min(100, synergyScore));
}

// Generate optimization suggestions based on current parameters
export function generateOptimizationSuggestions(parameters: SimulationParameters, outcomes: SimulationOutcomes): string[] {
  const suggestions: string[] = [];
  const { solarEnergyAdoption, windEnergyAdoption, policyStrength } = parameters;
  
  // Temperature-based suggestions
  if (outcomes.temperatureChange > 2.0) {
    suggestions.push("Consider increasing renewable energy adoption to meet the 2°C target");
  }
  
  // Balance suggestions
  const balance = Math.abs(solarEnergyAdoption - windEnergyAdoption);
  if (balance > 40) {
    if (solarEnergyAdoption > windEnergyAdoption) {
      suggestions.push("Try increasing wind energy to create a more balanced renewable portfolio");
    } else {
      suggestions.push("Try increasing solar energy to complement your wind strategy");
    }
  }
  
  // Policy suggestions
  if (policyStrength === 'low' && (solarEnergyAdoption + windEnergyAdoption) > 100) {
    suggestions.push("With high renewable targets, stronger policy support could improve feasibility");
  }
  
  // Economic efficiency suggestions
  if (outcomes.roi < 150) {
    suggestions.push("Consider adjusting the renewable energy mix to improve economic returns");
  }
  
  // Feasibility suggestions
  if (outcomes.feasibilityScore < 60) {
    suggestions.push("Current parameters may be challenging to implement - consider a more gradual approach");
  }
  
  // Sustainability suggestions
  if (outcomes.sustainabilityScore < 70) {
    suggestions.push("Increase overall renewable adoption for better long-term sustainability");
  }
  
  return suggestions.slice(0, 3); // Return max 3 suggestions
}

// Benchmark against real-world scenarios
export function benchmarkSolution(outcomes: SimulationOutcomes): string {
  const avgScore = (outcomes.feasibilityScore + outcomes.sustainabilityScore + outcomes.globalImpactScore) / 3;
  
  if (avgScore >= 85) {
    return "Exceptional - Your solution exceeds current best practices";
  } else if (avgScore >= 75) {
    return "Excellent - Comparable to leading climate initiatives";
  } else if (avgScore >= 65) {
    return "Good - Aligns with mainstream climate targets";
  } else if (avgScore >= 50) {
    return "Moderate - Room for improvement in key areas";
  } else {
    return "Challenging - Consider revising your approach";
  }
}
