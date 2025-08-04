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

// Economic factors with market variability
const SOLAR_COST_BASE = 50; // Base cost billion USD per 1% global adoption
const WIND_COST_BASE = 40; // Base cost billion USD per 1% global adoption
const POLICY_COST_MULTIPLIER = 0.3; // Additional cost for policy implementation

// Climate sensitivity parameters
const CLIMATE_SENSITIVITY = 3.0; // °C per CO2 doubling
const CO2_TO_TEMP_FACTOR = 0.0015; // Simplified temperature change per GtCO2e

// Add randomness factors for more varied results
function getRandomVariance(baseValue: number, variancePercent: number): number {
  const variance = baseValue * (variancePercent / 100);
  return baseValue + (Math.random() - 0.5) * 2 * variance;
}

// Market dynamics affecting costs
function calculateDynamicCosts(adoption: number, baseCost: number): number {
  // Economies of scale reduce costs, but supply constraints increase them
  const scaleDiscount = Math.min(0.3, adoption / 200); // Up to 30% discount
  const supplyPressure = adoption > 60 ? Math.pow((adoption - 60) / 100, 1.5) : 0;
  const marketVariance = getRandomVariance(1, 15); // ±15% market fluctuation
  
  return baseCost * (1 - scaleDiscount + supplyPressure) * marketVariance;
}

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
  
  // Calculate renewable energy impact with diminishing returns
  const totalRenewableAdoption = solarEnergyAdoption + windEnergyAdoption;
  const policyMultiplier = getRandomVariance(POLICY_MULTIPLIERS[policyStrength], 10);
  
  // Non-linear CO2 reduction with technological challenges
  const maxPossibleReduction = getRandomVariance(65, 8); // Market variability
  const renewableEfficiency = Math.pow(totalRenewableAdoption / 200, 0.85); // Diminishing returns
  const renewableContribution = renewableEfficiency * maxPossibleReduction;
  const policyBonus = (policyMultiplier - 1) * getRandomVariance(10, 25);
  
  // Add synergy effects and technological bottlenecks
  const synergyBonus = Math.abs(solarEnergyAdoption - windEnergyAdoption) < 30 ? 
    getRandomVariance(8, 30) : getRandomVariance(2, 50);
  const bottleneckPenalty = totalRenewableAdoption > 120 ? 
    Math.pow((totalRenewableAdoption - 120) / 80, 1.2) * getRandomVariance(5, 40) : 0;
    
  const co2Reduction = Math.max(5, Math.min(maxPossibleReduction, 
    renewableContribution + policyBonus + synergyBonus - bottleneckPenalty));
  
  // Temperature impact with climate feedback loops
  const emissionReduction = GLOBAL_EMISSIONS_BASELINE * (co2Reduction / 100);
  const baselineTemp = getRandomVariance(2.2, 12); // Climate uncertainty
  const tempReduction = emissionReduction * CO2_TO_TEMP_FACTOR * getRandomVariance(10, 20);
  const feedbackFactor = co2Reduction > 40 ? getRandomVariance(1.15, 15) : getRandomVariance(0.95, 10);
  const temperatureChange = Math.max(1.3, baselineTemp - (tempReduction * feedbackFactor));
  
  // Dynamic economic costs with market realities
  const solarCost = calculateDynamicCosts(solarEnergyAdoption, SOLAR_COST_BASE);
  const windCost = calculateDynamicCosts(windEnergyAdoption, WIND_COST_BASE);
  const infrastructureCost = Math.pow(totalRenewableAdoption / 100, 1.3) * getRandomVariance(500, 25);
  const policyCost = (solarCost + windCost) * POLICY_COST_MULTIPLIER * (policyMultiplier - 1);
  const totalCost = solarCost + windCost + infrastructureCost + policyCost;
  
  // ROI with economic uncertainties
  const avoidedClimateCosts = co2Reduction * getRandomVariance(120, 35); // Economic damage variance
  const economicBenefits = totalRenewableAdoption * getRandomVariance(25, 20); // Job creation, energy independence
  const roi = Math.max(-20, ((avoidedClimateCosts + economicBenefits) / totalCost) * 100);
  
  // Calculate scores with more realistic variance
  const feasibilityScore = calculateFeasibilityScore(solarEnergyAdoption, windEnergyAdoption, policyStrength);
  const sustainabilityScore = calculateSustainabilityScore(totalRenewableAdoption, temperatureChange);
  const globalImpactScore = calculateGlobalImpactScore(co2Reduction, temperatureChange, feasibilityScore);
  
  return {
    temperatureChange,
    co2Reduction,
    economicImpact: totalCost,
    roi,
    feasibilityScore,
    sustainabilityScore,
    globalImpactScore
  };
}

function simulateReforestation(parameters: SimulationParameters): SimulationOutcomes {
  const { solarEnergyAdoption, windEnergyAdoption, policyStrength } = parameters;
  const policyMultiplier = getRandomVariance(POLICY_MULTIPLIERS[policyStrength], 12);
  
  // Reforestation has different dynamics - slower but more sustainable
  const forestEffectiveness = getRandomVariance(0.45, 30); // More variable effectiveness
  const totalForestAction = solarEnergyAdoption + windEnergyAdoption; // Interpret as forest coverage %
  
  // Reforestation has delayed but compound effects
  const immediateCO2 = (totalForestAction / 200) * 25 * forestEffectiveness;
  const longTermCO2 = (totalForestAction / 200) * 35 * Math.pow(policyMultiplier, 1.2);
  const co2Reduction = Math.min(55, immediateCO2 + longTermCO2 * getRandomVariance(0.7, 25));
  
  // Temperature benefits accumulate over time with ecosystem effects
  const baselineTemp = getRandomVariance(2.05, 8);
  const directCooling = co2Reduction * CO2_TO_TEMP_FACTOR * getRandomVariance(6, 15);
  const albedoEffect = totalForestAction > 50 ? getRandomVariance(0.08, 30) : 0; // Cooling effect
  const biodiversityBonus = totalForestAction > 70 ? getRandomVariance(0.05, 40) : 0;
  const temperatureChange = Math.max(1.4, baselineTemp - directCooling - albedoEffect - biodiversityBonus);
  
  // Economic model: Lower upfront costs but longer payback
  const landCost = totalForestAction * getRandomVariance(15, 35); // Variable land prices
  const plantingCost = totalForestAction * getRandomVariance(8, 20);
  const maintenanceCost = totalForestAction * getRandomVariance(12, 25) * (policyMultiplier - 0.5);
  const economicImpact = landCost + plantingCost + maintenanceCost;
  
  // ROI includes ecosystem services and carbon credits
  const carbonCredit = co2Reduction * getRandomVariance(45, 30);
  const ecosystemServices = totalForestAction * getRandomVariance(35, 40); // Tourism, water, etc.
  const timberValue = totalForestAction > 60 ? totalForestAction * getRandomVariance(18, 50) : 0;
  const totalBenefits = carbonCredit + ecosystemServices + timberValue;
  const roi = Math.max(-15, (totalBenefits / economicImpact) * 100);
  
  const feasibilityScore = calculateFeasibilityScore(solarEnergyAdoption, windEnergyAdoption, policyStrength, 'reforestation');
  const sustainabilityScore = Math.min(100, calculateSustainabilityScore(totalForestAction, temperatureChange) + getRandomVariance(18, 25));
  const globalImpactScore = calculateGlobalImpactScore(co2Reduction, temperatureChange, feasibilityScore);
  
  return {
    temperatureChange,
    co2Reduction,
    economicImpact,
    roi,
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
