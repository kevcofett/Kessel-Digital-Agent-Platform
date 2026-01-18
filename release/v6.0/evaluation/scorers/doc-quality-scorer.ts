/**
 * DOC Quality Scorer
 *
 * Evaluates Document Generation agent responses for quality,
 * completeness, and appropriate formatting.
 *
 * @module doc-quality-scorer
 * @version 1.0.0
 */

import { Scorer } from "braintrust";

interface DOCScorerInput {
  output: string;
  expected?: {
    document_type?: string;
    should_include_sections?: string[];
    should_provide_download?: boolean;
  };
}

/**
 * DOC Quality Scorer
 *
 * Evaluates DOC responses across 5 dimensions:
 * 1. Document type acknowledged
 * 2. Sections mentioned
 * 3. Format mentioned
 * 4. Completeness verified
 * 5. Download/link provided
 */
export const docQualityScorer: Scorer<string, { expected: DOCScorerInput["expected"] }> = {
  name: "doc-quality",
  scorer: async ({ output, expected }) => {
    let score = 0;
    const maxScore = 5;
    const details: Record<string, boolean> = {};

    // 1. Check document type acknowledged (20%)
    const docTypePatterns = [
      /plan/i,
      /summary/i,
      /brief/i,
      /report/i,
      /presentation/i,
      /document/i,
      /post.?mortem/i,
      /measurement/i,
    ];
    details.doc_type_acknowledged = docTypePatterns.some((p) => p.test(output));
    if (details.doc_type_acknowledged) score += 1;

    // 2. Check sections mentioned (20%)
    const sectionPatterns = [
      /section/i,
      /executive/i,
      /budget/i,
      /channel/i,
      /timeline/i,
      /objective/i,
      /audience/i,
      /recommendation/i,
    ];
    details.sections_mentioned = sectionPatterns.some((p) => p.test(output));
    if (details.sections_mentioned) score += 1;

    // 3. Check format mentioned (20%)
    const formatPatterns = [
      /DOCX/i,
      /PDF/i,
      /PPTX/i,
      /Word/i,
      /PowerPoint/i,
      /Excel/i,
      /format/i,
    ];
    details.format_mentioned = formatPatterns.some((p) => p.test(output));
    if (details.format_mentioned) score += 1;

    // 4. Check completeness verified (20%)
    const completenessPatterns = [
      /complete/i,
      /verify/i,
      /check/i,
      /validate/i,
      /all sections/i,
      /included/i,
      /ready/i,
    ];
    details.completeness_verified = completenessPatterns.some((p) =>
      p.test(output)
    );
    if (details.completeness_verified) score += 1;

    // 5. Check download/link provided (20%)
    const downloadPatterns = [
      /download/i,
      /link/i,
      /generated/i,
      /ready/i,
      /access/i,
      /sharepoint/i,
      /\.docx|\.pdf|\.pptx/i,
    ];
    details.download_provided = downloadPatterns.some((p) => p.test(output));
    if (details.download_provided) score += 1;

    // Bonus: Check for expected sections
    let bonusScore = 0;
    if (expected?.should_include_sections) {
      const sectionsFound = expected.should_include_sections.filter((section) =>
        new RegExp(section, "i").test(output)
      );
      bonusScore = (sectionsFound.length / expected.should_include_sections.length) * 0.5;
    }

    const finalScore = Math.min((score + bonusScore) / maxScore, 1);

    return {
      name: "doc-quality",
      score: finalScore,
      metadata: {
        rawScore: score,
        bonusScore,
        maxScore,
        details,
        scoreBreakdown: {
          docType: details.doc_type_acknowledged ? 1 : 0,
          sections: details.sections_mentioned ? 1 : 0,
          format: details.format_mentioned ? 1 : 0,
          completeness: details.completeness_verified ? 1 : 0,
          download: details.download_provided ? 1 : 0,
        },
      },
    };
  },
};

/**
 * DOC Template Compliance Scorer
 *
 * Evaluates adherence to document templates.
 */
export const docTemplateComplianceScorer: Scorer<string, { expected: any }> = {
  name: "doc-template-compliance",
  scorer: async ({ output, expected }) => {
    let score = 0;
    const maxScore = 4;
    const details: Record<string, boolean> = {};

    // Check for proper structure
    details.has_structure = /section|chapter|part|heading/i.test(output);
    if (details.has_structure) score += 1;

    // Check for branding mention
    details.branding_aware = /brand|logo|color|style|format/i.test(output);
    if (details.branding_aware) score += 1;

    // Check for metadata inclusion
    details.metadata_included = /date|version|prepared|author|client/i.test(
      output
    );
    if (details.metadata_included) score += 1;

    // Check for confidentiality
    details.confidentiality_noted =
      /confidential|internal|proprietary|distribution/i.test(output);
    if (details.confidentiality_noted) score += 1;

    return {
      name: "doc-template-compliance",
      score: score / maxScore,
      metadata: {
        rawScore: score,
        maxScore,
        details,
      },
    };
  },
};

/**
 * DOC Presentation Scorer
 *
 * Evaluates presentation-specific outputs.
 */
export const docPresentationScorer: Scorer<string, { expected: any }> = {
  name: "doc-presentation",
  scorer: async ({ output, expected }) => {
    let score = 0;
    const maxScore = 4;
    const details: Record<string, boolean> = {};

    // Check for slide mention
    details.slides_mentioned = /slide|deck|presentation|pptx/i.test(output);
    if (details.slides_mentioned) score += 1;

    // Check for visual elements
    details.visuals_addressed = /chart|graph|visual|image|table/i.test(output);
    if (details.visuals_addressed) score += 1;

    // Check for speaker notes
    details.notes_included = /note|speaker|talking point/i.test(output);
    if (details.notes_included) score += 1;

    // Check for audience consideration
    details.audience_considered =
      /leadership|executive|client|stakeholder|audience/i.test(output);
    if (details.audience_considered) score += 1;

    return {
      name: "doc-presentation",
      score: score / maxScore,
      metadata: {
        rawScore: score,
        maxScore,
        details,
      },
    };
  },
};

export default docQualityScorer;
