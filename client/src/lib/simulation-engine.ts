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
const SOLAR_COST_BASE = 50; // Base cost billion USD per 1% global adoption
const WIND_COST_BASE = 40; // Base cost billion USD per 1% global adoption
const POLICY_COST_MULTIPLIER = 0.3; // Additional cost for policy implementation

// Climate sensitivity parameters
const CLIMATE_SENSITIVITY = 3.0; // °C per CO2 doubling
const CO2_TO_TEMP_FACTOR = 0.0015; // Simplified temperature change per GtCO2e

// Market dynamics affecting costs based on real economic principles
function calculateDynamicCosts(adoption: number, baseCost: number): number {
  // Economies of scale reduce costs (learning curve effect)
  const scaleDiscount = Math.min(0.25, adoption / 180); // Up to 25% discount based on Wright's Law
  
  // Supply constraints increase costs above 70% adoption
  const supplyPressure = adoption > 70 ? Math.pow((adoption - 70) / 100, 1.2) * 0.5 : 0;
  
  return baseCost * (1 - scaleDiscount + supplyPressure);
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
  
  // Calculate renewable energy impact based on real-world data
  const totalRenewableAdoption = solarEnergyAdoption + windEnergyAdoption;
  const policyMultiplier = POLICY_MULTIPLIERS[policyStrength];
  
  // Realistic CO2 reduction based on IEA projections
  const maxTheoreticalReduction = 75; // Based on IEA Net Zero scenario
  const renewableEfficiency = Math.pow(totalRenewableAdoption / 200, 0.9); // Realistic diminishing returns
  const renewableContribution = renewableEfficiency * maxTheoreticalReduction;
  
  // Policy effectiveness based on historical data (Carbon Brief analysis)
  const policyBonus = (policyMultiplier - 1) * 12; // Conservative policy impact
  
  // Portfolio diversity bonus (based on grid stability research)
  const diversityRatio = Math.min(solarEnergyAdoption, windEnergyAdoption) / Math.max(solarEnergyAdoption, windEnergyAdoption, 1);
  const synergyBonus = diversityRatio * 5; // Up to 5% bonus for balanced portfolio
  
  // Grid integration challenges above 70% renewable penetration
  const integrationPenalty = totalRenewableAdoption > 140 ? 
    Math.pow((totalRenewableAdoption - 140) / 60, 1.5) * 8 : 0;
    
  const co2Reduction = Math.max(2, Math.min(maxTheoreticalReduction, 
    renewableContribution + policyBonus + synergyBonus - integrationPenalty));
  
  // Temperature impact based on IPCC climate sensitivity
  const emissionReduction = GLOBAL_EMISSIONS_BASELINE * (co2Reduction / 100);
  const baselineTemp = 2.4; // IPCC baseline for current trajectory
  const tempReduction = emissionReduction * CO2_TO_TEMP_FACTOR;
  
  // Climate feedback factor (conservative estimate)
  const feedbackFactor = co2Reduction > 50 ? 1.1 : 1.0;
  const temperatureChange = Math.max(1.2, baselineTemp - (tempReduction * feedbackFactor));
  
  // Economic costs based on IRENA and IEA cost projections
  const solarCost = calculateDynamicCosts(solarEnergyAdoption, SOLAR_COST_BASE);
  const windCost = calculateDynamicCosts(windEnergyAdoption, WIND_COST_BASE);
  
  // Infrastructure costs based on grid modernization studies
  const infrastructureCost = Math.pow(totalRenewableAdoption / 100, 1.2) * 400;
  
  // Policy implementation costs
  const policyCost = (solarCost + windCost) * POLICY_COST_MULTIPLIER * (policyMultiplier - 1);
  const totalCost = solarCost + windCost + infrastructureCost + policyCost;
  
  // ROI based on Stern Review and recent climate economics
  const avoidedClimateCosts = co2Reduction * 85; // $85 per ton CO2 (social cost of carbon)
  const economicBenefits = totalRenewableAdoption * 18; // Job creation and energy security
  const roi = Math.max(-10, ((avoidedClimateCosts + economicBenefits) / totalCost) * 100);
  
  // Calculate scores with realistic assessment
  const feasibilityScore = calculateFeasibilityScore(solarEnergyAdoption, windEnergyAdoption, policyStrength);
  const sustainabilityScore = calculateSustainabilityScore(totalRenewableAdoption, temperatureChange);
  const globalImpactScore = calculateGlobalImpactScore(co2Reduction, temperatureChange, feasibilityScore);
  
  // Round all numeric values to 1 decimal place for consistency
  return {
    temperatureChange: Math.round(temperatureChange * 10) / 10,
    co2Reduction: Math.round(co2Reduction * 10) / 10,
    economicImpact: Math.round(totalCost * 10) / 10,
    roi: Math.round(roi * 10) / 10,
    feasibilityScore: Math.round(feasibilityScore),
    sustainabilityScore: Math.round(sustainabilityScore),
    globalImpactScore: Math.round(globalImpactScore)
  };
}

function simulateReforestation(parameters: SimulationParameters): SimulationOutcomes {
  const { solarEnergyAdoption, windEnergyAdoption, policyStrength } = parameters;
  const policyMultiplier = POLICY_MULTIPLIERS[policyStrength];
  
  // Reforestation effectiveness based on scientific studies
  const forestEffectiveness = 0.6; // Average effectiveness from meta-analysis
  const totalForestAction = solarEnergyAdoption + windEnergyAdoption; // Interpret as forest coverage %
  
  // Realistic carbon sequestration rates (based on forest type and age)
  const youngForestSequestration = (totalForestAction / 200) * 15 * forestEffectiveness; // First 20 years
  const matureForestSequestration = (totalForestAction / 200) * 25 * policyMultiplier; // After 20 years
  const co2Reduction = Math.min(45, youngForestSequestration + matureForestSequestration * 0.8);
  
  // Temperature benefits based on carbon cycle and albedo effects
  const baselineTemp = 2.3; // Current trajectory
  const directCooling = co2Reduction * CO2_TO_TEMP_FACTOR;
  
  // Albedo effect (cooling from forest cover)
  const albedoEffect = totalForestAction > 100 ? 0.05 : (totalForestAction / 100) * 0.05;
  
  // Biodiversity and ecosystem services cooling effect
  const ecosystemCooling = totalForestAction > 120 ? 0.02 : 0;
  const temperatureChange = Math.max(1.3, baselineTemp - directCooling - albedoEffect - ecosystemCooling);
  
  // Economic model based on FAO forestry economics
  const landAcquisitionCost = totalForestAction * 12; // $12B per 1% global forest cover
  const plantingCost = totalForestAction * 6; // $6B per 1% for planting and initial care
  const maintenanceCost = totalForestAction * 8 * policyMultiplier; // Ongoing management
  const economicImpact = landAcquisitionCost + plantingCost + maintenanceCost;
  
  // ROI based on ecosystem services valuation (Costanza et al.)
  const carbonCredits = co2Reduction * 50; // $50 per ton CO2 for forest credits
  const ecosystemServices = totalForestAction * 28; // Water regulation, biodiversity, tourism
  const sustainableTimber = totalForestAction > 80 ? totalForestAction * 12 : 0; // Sustainable harvesting
  const totalBenefits = carbonCredits + ecosystemServices + sustainableTimber;
  const roi = Math.max(-5, (totalBenefits / economicImpact) * 100);
  
  const feasibilityScore = calculateFeasibilityScore(solarEnergyAdoption, windEnergyAdoption, policyStrength, 'reforestation');
  const sustainabilityScore = Math.min(100, calculateSustainabilityScore(totalForestAction, temperatureChange) + 15);
  const globalImpactScore = calculateGlobalImpactScore(co2Reduction, temperatureChange, feasibilityScore);
  
  // Round all numeric values to 1 decimal place for consistency
  return {
    temperatureChange: Math.round(temperatureChange * 10) / 10,
    co2Reduction: Math.round(co2Reduction * 10) / 10,
    economicImpact: Math.round(economicImpact * 10) / 10,
    roi: Math.round(roi * 10) / 10,
    feasibilityScore: Math.round(feasibilityScore),
    sustainabilityScore: Math.round(sustainabilityScore),
    globalImpactScore: Math.round(globalImpactScore)
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