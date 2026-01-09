/**
 * MPA Validation Tools
 *
 * Tools for validating media plans against quality gates and calculating CAC metrics.
 * Implements the 3-gate validation framework from MPA v5.5.
 */

import { tool } from 'ai';
import { z } from 'zod';
import { dataverseClient } from '../../utils/dataverse-client.js';
import { DATAVERSE_TABLES } from '../../config/dataverse.js';
// getBenchmarks imported but used only in main tool execution

/**
 * Validation gap interface
 */
export interface ValidationGap {
  step: number;
  area: string;
  issue: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
}

/**
 * Validation warning interface
 */
export interface ValidationWarning {
  step: number;
  area: string;
  issue: string;
  recommendation: string;
}

/**
 * Validation recommendation interface
 */
export interface ValidationRecommendation {
  step: number;
  area: string;
  suggestion: string;
}

/**
 * Plan validation result interface
 */
export interface PlanValidationResult {
  planId: string;
  gateNumber: number;
  passed: boolean;
  gaps: ValidationGap[];
  warnings: ValidationWarning[];
  recommendations: ValidationRecommendation[];
  readyToFinalize: boolean;
  summary: string;
}

/**
 * CAC analysis result interface
 */
export interface CACAnalysisResult {
  targetCAC: string;
  budget: number;
  targetConversions: number;
  verticalCode: string;
  benchmarkComparison: string;
  feasibility: 'Aggressive' | 'Achievable' | 'Conservative' | 'High' | 'Unknown';
  ltvAnalysis: {
    ltv: number;
    cac: number;
    ratio: string;
    assessment: string;
    recommendation: string | null;
  } | null;
  methodology: string;
}

/**
 * Section status enum matching Dataverse
 */
type SectionStatus = 'NotStarted' | 'InProgress' | 'Complete' | 'Skipped';

/**
 * Section type enum matching Dataverse
 */
type SectionType =
  | 'ClientContext'
  | 'Objectives'
  | 'Budget'
  | 'Audience'
  | 'ChannelMix'
  | 'Partners'
  | 'Measurement'
  | 'Optimization'
  | 'Compliance'
  | 'FinalPlan';

/**
 * Plan section data from Dataverse
 */
interface PlanSection {
  mpa_sectiontype: SectionType;
  mpa_stepnumber: number;
  mpa_sectiondata: string;
  mpa_sectionstatus: SectionStatus;
}

/**
 * Channel allocation data from section
 */
interface ChannelAllocation {
  channel_code: string;
  allocation_percent: number;
}

/**
 * validatePlan Tool
 *
 * Validate a media plan against quality gates and completeness requirements.
 * Gate 1: Strategy (Steps 1-3), Gate 2: Execution (Steps 4-7), Gate 3: Measurement (Steps 8-10)
 */
export const validatePlan = tool({
  description:
    'Validate a media plan against quality gates and completeness requirements. Returns gaps, warnings, and recommendations.',
  parameters: z.object({
    plan_id: z.string().describe('Media plan GUID'),
    gate_number: z.number().min(1).max(3).describe('Validation gate: 1=Strategy, 2=Execution, 3=Measurement'),
  }),
  execute: async ({ plan_id, gate_number }): Promise<PlanValidationResult> => {
    const validation: PlanValidationResult = {
      planId: plan_id,
      gateNumber: gate_number,
      passed: true,
      gaps: [],
      warnings: [],
      recommendations: [],
      readyToFinalize: false,
      summary: '',
    };

    try {
      const plan = await dataverseClient.get<Record<string, unknown>>(
        DATAVERSE_TABLES.mpa.mediaplan,
        plan_id,
        'mpa_totalbudget,mpa_planname,mpa_status,mpa_verticalcode'
      );

      const sections = await dataverseClient.query<PlanSection>(DATAVERSE_TABLES.mpa.plandata, {
        $filter: `mpa_planid eq '${plan_id}'`,
        $orderby: 'mpa_stepnumber asc',
      });

      const totalBudget = plan.mpa_totalbudget as number | undefined;
      // Note: verticalCode available for future benchmarking: (plan.mpa_verticalcode as string) ?? 'GENERAL'

      if (gate_number >= 1) {
        const objectivesSection = sections.find((s) => s.mpa_sectiontype === 'Objectives');
        const audienceSection = sections.find((s) => s.mpa_sectiontype === 'Audience');

        if (!objectivesSection || objectivesSection.mpa_sectionstatus !== 'Complete') {
          validation.passed = false;
          validation.gaps.push({
            step: 1,
            area: 'Objectives',
            issue: 'Primary objective not defined or incomplete',
            severity: 'Critical',
          });
        } else {
          const objectiveData = safeJsonParse(objectivesSection.mpa_sectiondata);
          if (!objectiveData?.primary_objective) {
            validation.passed = false;
            validation.gaps.push({
              step: 1,
              area: 'Objectives',
              issue: 'Primary objective not specified',
              severity: 'Critical',
            });
          }

          if (totalBudget && objectiveData?.target_volume) {
            const targetVolume = objectiveData.target_volume as number;
            const impliedCAC = totalBudget / targetVolume;
            if (impliedCAC < 10) {
              validation.warnings.push({
                step: 2,
                area: 'Economics',
                issue: `Implied CAC of $${impliedCAC.toFixed(2)} is unrealistically low`,
                recommendation: 'Validate target volume against industry benchmarks and historical data',
              });
            } else if (impliedCAC > 500) {
              validation.warnings.push({
                step: 2,
                area: 'Economics',
                issue: `Implied CAC of $${impliedCAC.toFixed(2)} is very high`,
                recommendation: 'Review budget efficiency or adjust target conversion volume',
              });
            }
          }
        }

        if (!audienceSection || audienceSection.mpa_sectionstatus === 'NotStarted') {
          validation.passed = false;
          validation.gaps.push({
            step: 3,
            area: 'Audience',
            issue: 'Audience definition missing',
            severity: 'Critical',
          });
        } else if (audienceSection.mpa_sectionstatus === 'InProgress') {
          validation.warnings.push({
            step: 3,
            area: 'Audience',
            issue: 'Audience definition is in progress',
            recommendation: 'Complete audience definition before proceeding to channel selection',
          });
        }
      }

      if (gate_number >= 2) {
        const channelSection = sections.find((s) => s.mpa_sectiontype === 'ChannelMix');
        const budgetSection = sections.find((s) => s.mpa_sectiontype === 'Budget');

        if (!channelSection || channelSection.mpa_sectionstatus === 'NotStarted') {
          validation.passed = false;
          validation.gaps.push({
            step: 7,
            area: 'Channel Mix',
            issue: 'No channel allocation defined',
            severity: 'Critical',
          });
        } else {
          const channelData = safeJsonParse(channelSection.mpa_sectiondata);
          const allocations = (channelData?.allocations as ChannelAllocation[]) ?? [];

          if (allocations.length === 0) {
            validation.passed = false;
            validation.gaps.push({
              step: 7,
              area: 'Channel Mix',
              issue: 'Channel allocations array is empty',
              severity: 'Critical',
            });
          } else {
            const totalAllocation = allocations.reduce((sum, a) => sum + (a.allocation_percent ?? 0), 0);

            if (Math.abs(totalAllocation - 100) > 1) {
              validation.passed = false;
              validation.gaps.push({
                step: 7,
                area: 'Channel Mix',
                issue: `Channel allocations sum to ${totalAllocation.toFixed(1)}%, must equal 100%`,
                severity: 'Critical',
              });
            }

            if (totalBudget) {
              for (const allocation of allocations) {
                const channelBudget = totalBudget * (allocation.allocation_percent / 100);

                try {
                  const channels = await dataverseClient.query<Record<string, unknown>>(
                    DATAVERSE_TABLES.mpa.channel,
                    {
                      $filter: `mpa_channelcode eq '${allocation.channel_code}'`,
                      $select: 'mpa_minbudget,mpa_channelname',
                      $top: 1,
                    }
                  );

                  if (channels.length > 0 && channels[0]) {
                    const minBudget = channels[0].mpa_minbudget as number | undefined;
                    const channelName = channels[0].mpa_channelname as string;

                    if (minBudget && channelBudget < minBudget) {
                      validation.warnings.push({
                        step: 7,
                        area: 'Channel Mix',
                        issue: `${channelName} budget of $${channelBudget.toFixed(0)} is below minimum of $${minBudget}`,
                        recommendation: 'Reallocate to meet channel minimums or remove channel from mix',
                      });
                    }
                  }
                } catch (error) {
                  console.warn(`Failed to validate channel minimum for ${allocation.channel_code}:`, error);
                }
              }
            }
          }
        }

        if (!budgetSection || budgetSection.mpa_sectionstatus !== 'Complete') {
          validation.warnings.push({
            step: 5,
            area: 'Budget',
            issue: 'Budget section not marked complete',
            recommendation: 'Review and confirm budget allocation before finalizing',
          });
        }

        const geographySection = sections.find((s) => s.mpa_stepnumber === 4);
        if (!geographySection) {
          validation.recommendations.push({
            step: 4,
            area: 'Geography',
            suggestion: 'Consider documenting geographic targeting strategy for completeness',
          });
        }
      }

      if (gate_number >= 3) {
        const measurementSection = sections.find((s) => s.mpa_sectiontype === 'Measurement');
        const optimizationSection = sections.find((s) => s.mpa_sectiontype === 'Optimization');
        const risksSection = sections.find((s) => s.mpa_stepnumber === 10);

        if (!measurementSection || measurementSection.mpa_sectionstatus !== 'Complete') {
          validation.passed = false;
          validation.gaps.push({
            step: 8,
            area: 'Measurement',
            issue: 'Measurement approach not defined or incomplete',
            severity: 'High',
          });
        } else {
          const measurementData = safeJsonParse(measurementSection.mpa_sectiondata);
          const kpis = measurementData?.kpis as unknown[] | undefined;
          if (!kpis || kpis.length === 0) {
            validation.warnings.push({
              step: 8,
              area: 'Measurement',
              issue: 'No KPIs specified in measurement section',
              recommendation: 'Define primary and secondary KPIs for campaign tracking',
            });
          }
        }

        if (!optimizationSection) {
          validation.recommendations.push({
            step: 9,
            area: 'Optimization',
            suggestion: 'Consider documenting optimization triggers and testing approach',
          });
        }

        if (!risksSection) {
          validation.recommendations.push({
            step: 10,
            area: 'Risks',
            suggestion: 'Consider documenting key risks and mitigation strategies before finalization',
          });
        }
      }

      validation.readyToFinalize = validation.passed && validation.gaps.length === 0;
      validation.summary = validation.passed
        ? `Plan passes Gate ${gate_number} validation with ${validation.warnings.length} warnings and ${validation.recommendations.length} recommendations.`
        : `Plan fails Gate ${gate_number} validation. ${validation.gaps.length} critical gap(s) require resolution.`;

      return validation;
    } catch (error) {
      console.error('validatePlan error:', error);

      return {
        planId: plan_id,
        gateNumber: gate_number,
        passed: false,
        gaps: [
          {
            step: 0,
            area: 'System',
            issue: `Validation failed due to system error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            severity: 'Critical',
          },
        ],
        warnings: [],
        recommendations: [],
        readyToFinalize: false,
        summary: 'Validation could not be completed due to a system error.',
      };
    }
  },
});

/**
 * calculateCAC Tool
 *
 * Calculate Customer Acquisition Cost and compare to benchmarks and LTV.
 */
export const calculateCAC = tool({
  description:
    'Calculate Customer Acquisition Cost and compare to industry benchmarks and Lifetime Value.',
  parameters: z.object({
    budget: z.number().describe('Total campaign budget in dollars'),
    target_conversions: z.number().describe('Target number of conversions/acquisitions'),
    ltv: z.number().optional().describe('Customer Lifetime Value (optional)'),
    vertical_code: z.string().default('GENERAL').describe('Industry vertical code'),
  }),
  execute: async ({ budget, target_conversions, ltv, vertical_code }): Promise<CACAnalysisResult> => {
    const cac = budget / target_conversions;

    let benchmarkComparison = 'No benchmark data available';
    let feasibility: CACAnalysisResult['feasibility'] = 'Unknown';

    try {
      const benchmarks = await dataverseClient.query<Record<string, unknown>>(
        DATAVERSE_TABLES.mpa.benchmark,
        {
          $filter: `mpa_verticalcode eq '${vertical_code}' and mpa_kpicode eq 'CPA' and mpa_isactive eq true`,
          $select: 'mpa_metriclow,mpa_metricmedian,mpa_metrichigh,mpa_channelcode',
        }
      );

      if (benchmarks.length > 0) {
        const avgLow =
          benchmarks.reduce((sum, b) => sum + ((b.mpa_metriclow as number) ?? 0), 0) / benchmarks.length;
        const avgMedian =
          benchmarks.reduce((sum, b) => sum + ((b.mpa_metricmedian as number) ?? 0), 0) / benchmarks.length;
        const avgHigh =
          benchmarks.reduce((sum, b) => sum + ((b.mpa_metrichigh as number) ?? 0), 0) / benchmarks.length;

        if (cac < avgLow) {
          feasibility = 'Aggressive';
          benchmarkComparison = `Target CAC of $${cac.toFixed(2)} is below industry low of $${avgLow.toFixed(2)}. This is aggressive and requires exceptional targeting or conversion rates.`;
        } else if (cac <= avgMedian) {
          feasibility = 'Achievable';
          benchmarkComparison = `Target CAC of $${cac.toFixed(2)} is at or below industry median of $${avgMedian.toFixed(2)}. Achievable with good execution.`;
        } else if (cac <= avgHigh) {
          feasibility = 'Conservative';
          benchmarkComparison = `Target CAC of $${cac.toFixed(2)} is above median but within typical range (high: $${avgHigh.toFixed(2)}). Conservative and achievable.`;
        } else {
          feasibility = 'High';
          benchmarkComparison = `Target CAC of $${cac.toFixed(2)} exceeds typical industry range (high: $${avgHigh.toFixed(2)}). Consider optimization opportunities.`;
        }
      }
    } catch (error) {
      console.warn('Failed to fetch CPA benchmarks:', error);
      benchmarkComparison = 'Unable to retrieve benchmark data for comparison.';
    }

    let ltvAnalysis: CACAnalysisResult['ltvAnalysis'] = null;
    if (ltv !== undefined && ltv > 0) {
      const ltvCacRatio = ltv / cac;
      let assessment: string;
      let recommendation: string | null = null;

      if (ltvCacRatio >= 3) {
        assessment = 'Healthy (3:1 or better) - sustainable growth model';
      } else if (ltvCacRatio >= 2) {
        assessment = 'Acceptable (2:1 to 3:1) - viable but monitor closely';
      } else if (ltvCacRatio >= 1) {
        assessment = 'Marginal (1:1 to 2:1) - break-even, needs optimization';
        recommendation =
          'Consider increasing LTV through retention strategies or reducing CAC through targeting optimization.';
      } else {
        assessment = 'Unsustainable (below 1:1) - losing money per customer';
        recommendation =
          'Urgent: Significantly reduce CAC or increase LTV. Review targeting, pricing, and retention strategies.';
      }

      ltvAnalysis = {
        ltv,
        cac,
        ratio: ltvCacRatio.toFixed(2),
        assessment,
        recommendation,
      };
    }

    return {
      targetCAC: cac.toFixed(2),
      budget,
      targetConversions: target_conversions,
      verticalCode: vertical_code,
      benchmarkComparison,
      feasibility,
      ltvAnalysis,
      methodology:
        'CAC = Budget / Target Conversions. LTV/CAC ratio should be 3:1 or higher for sustainable growth. Benchmarks sourced from Dataverse mpa_benchmark table.',
    };
  },
});

/**
 * Safe JSON parse utility
 */
function safeJsonParse(jsonString: string | null | undefined): Record<string, unknown> | null {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Standalone executor for validatePlan (for direct API calls)
 */
export async function executeValidation(
  plan_id: string,
  gate: 1 | 2 | 3,
  plan_data?: Record<string, unknown>
): Promise<PlanValidationResult> {
  const validation: PlanValidationResult = {
    planId: plan_id,
    gateNumber: gate,
    passed: true,
    gaps: [],
    warnings: [],
    recommendations: [],
    readyToFinalize: false,
    summary: '',
  };

  if (plan_data) {
    // Validate provided plan data
    if (!plan_data.objectives) {
      validation.gaps.push({
        step: 2,
        area: 'Objectives',
        issue: 'No objectives defined in plan data',
        severity: 'Critical',
      });
      validation.passed = false;
    }

    if (!plan_data.budget) {
      validation.gaps.push({
        step: 3,
        area: 'Budget',
        issue: 'No budget defined in plan data',
        severity: 'Critical',
      });
      validation.passed = false;
    }

    if (gate >= 2 && !plan_data.channels) {
      validation.gaps.push({
        step: 6,
        area: 'Channels',
        issue: 'No channel allocation defined',
        severity: 'High',
      });
      validation.passed = false;
    }

    if (gate >= 3 && !plan_data.measurement) {
      validation.gaps.push({
        step: 8,
        area: 'Measurement',
        issue: 'No measurement approach defined',
        severity: 'High',
      });
      validation.passed = false;
    }

    validation.readyToFinalize = validation.passed && gate === 3;
    validation.summary = validation.passed
      ? `Plan passes Gate ${gate} validation.`
      : `Plan fails Gate ${gate} with ${validation.gaps.length} gap(s).`;

    return validation;
  }

  // Default response for missing plan data
  validation.passed = false;
  validation.gaps.push({
    step: 0,
    area: 'System',
    issue: 'Plan data not provided and Dataverse query not available',
    severity: 'Critical',
  });
  validation.summary = 'Validation requires plan data.';

  return validation;
}

/**
 * Standalone executor for calculateCAC (for direct API calls)
 */
export async function executeCACAnalysis(
  channel_code: string,
  vertical_code: string,
  budget: number,
  projected_conversions: number,
  conversion_value?: number,
  ltv_estimate?: number
): Promise<CACAnalysisResult> {
  const cac = budget / projected_conversions;

  let benchmarkComparison = 'Benchmark data not available.';
  let feasibility: CACAnalysisResult['feasibility'] = 'Unknown';

  // Simple heuristics without Dataverse lookup
  if (cac < 25) {
    feasibility = 'Aggressive';
    benchmarkComparison = `Target CAC of $${cac.toFixed(2)} is aggressive for most channels.`;
  } else if (cac < 50) {
    feasibility = 'Achievable';
    benchmarkComparison = `Target CAC of $${cac.toFixed(2)} is generally achievable with good targeting.`;
  } else if (cac < 100) {
    feasibility = 'Conservative';
    benchmarkComparison = `Target CAC of $${cac.toFixed(2)} is conservative and typically achievable.`;
  } else {
    feasibility = 'High';
    benchmarkComparison = `Target CAC of $${cac.toFixed(2)} is high - consider optimization opportunities.`;
  }

  let ltvAnalysis: CACAnalysisResult['ltvAnalysis'] = null;
  const ltv = ltv_estimate ?? conversion_value;
  if (ltv !== undefined && ltv > 0) {
    const ltvCacRatio = ltv / cac;
    let assessment: string;
    let recommendation: string | null = null;

    if (ltvCacRatio >= 3) {
      assessment = 'Healthy (3:1 or better)';
    } else if (ltvCacRatio >= 2) {
      assessment = 'Acceptable (2:1 to 3:1)';
    } else if (ltvCacRatio >= 1) {
      assessment = 'Marginal (1:1 to 2:1)';
      recommendation = 'Consider increasing LTV or reducing CAC.';
    } else {
      assessment = 'Unsustainable (below 1:1)';
      recommendation = 'Urgent: Reduce CAC or increase LTV.';
    }

    ltvAnalysis = {
      ltv,
      cac,
      ratio: ltvCacRatio.toFixed(2),
      assessment,
      recommendation,
    };
  }

  return {
    targetCAC: cac.toFixed(2),
    budget,
    targetConversions: projected_conversions,
    verticalCode: vertical_code,
    benchmarkComparison,
    feasibility,
    ltvAnalysis,
    methodology: 'CAC = Budget / Target Conversions. Channel: ' + channel_code,
  };
}

/**
 * Validation gate descriptions
 */
export const VALIDATION_GATES = {
  1: {
    name: 'Strategy Gate',
    description: 'Validates objectives, economics, and audience definition (Steps 1-3)',
    requiredSections: ['Objectives', 'Audience'],
    steps: [1, 2, 3],
  },
  2: {
    name: 'Execution Gate',
    description: 'Validates geography, budget, value proposition, and channel mix (Steps 4-7)',
    requiredSections: ['Budget', 'ChannelMix'],
    steps: [4, 5, 6, 7],
  },
  3: {
    name: 'Measurement Gate',
    description: 'Validates measurement, testing, and risk assessment (Steps 8-10)',
    requiredSections: ['Measurement'],
    steps: [8, 9, 10],
  },
} as const;

/**
 * Plan completeness score calculator
 */
export function calculateCompletenessScore(sections: Array<{ status: SectionStatus }>): {
  score: number;
  grade: string;
} {
  const totalSections = sections.length;
  if (totalSections === 0) return { score: 0, grade: 'Not Started' };

  const completedSections = sections.filter((s) => s.status === 'Complete').length;
  const inProgressSections = sections.filter((s) => s.status === 'InProgress').length;

  const score = ((completedSections + inProgressSections * 0.5) / totalSections) * 100;

  let grade: string;
  if (score >= 90) grade = 'Excellent';
  else if (score >= 75) grade = 'Good';
  else if (score >= 50) grade = 'Fair';
  else if (score >= 25) grade = 'Needs Work';
  else grade = 'Just Started';

  return {
    score: parseFloat(score.toFixed(1)),
    grade,
  };
}
