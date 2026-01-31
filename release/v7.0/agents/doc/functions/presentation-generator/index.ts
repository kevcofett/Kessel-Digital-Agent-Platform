/**
 * Presentation Generator Azure Function
 *
 * Generates PowerPoint presentations (PPTX) for media plans, campaign reviews,
 * and client presentations using the pptxgenjs library.
 *
 * @module presentation-generator
 * @version 1.0.0
 * @agent DOC (Document Generation)
 */

import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import PptxGenJS from "pptxgenjs";

/**
 * Presentation request interface
 */
interface PresentationRequest {
  session_id: string;
  request_id: string;
  campaign_name: string;
  client_name: string;
  presentation_type: "CAMPAIGN_OVERVIEW" | "PERFORMANCE_REVIEW" | "STRATEGY_DECK" | "RECOMMENDATION";
  slides: SlideData[];
  branding?: BrandingConfig;
  metadata?: PresentationMetadata;
}

interface SlideData {
  title: string;
  subtitle?: string;
  content: string[];
  type: "title" | "bullets" | "table" | "two_column" | "chart_placeholder" | "section_header";
  table_data?: string[][];
  left_column?: string[];
  right_column?: string[];
  notes?: string;
}

interface BrandingConfig {
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  logo_url?: string;
}

interface PresentationMetadata {
  author?: string;
  company?: string;
  subject?: string;
  keywords?: string[];
}

/**
 * Presentation response interface
 */
interface PresentationResponse {
  success: boolean;
  filename: string;
  content_base64: string;
  content_type: string;
  slide_count: number;
  generated_at: string;
}

/**
 * Default color scheme
 */
const COLORS = {
  PRIMARY: "4472C4",
  SECONDARY: "2F5496",
  ACCENT: "70AD47",
  TEXT_DARK: "363636",
  TEXT_LIGHT: "FFFFFF",
  BACKGROUND: "F2F2F2",
  TABLE_HEADER: "4472C4",
  TABLE_ROW_ALT: "D6DCE5",
};

/**
 * Main Azure Function handler
 */
const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log("Presentation Generator function processing request");

  try {
    const request: PresentationRequest = req.body;

    if (!request || !request.campaign_name || !request.slides) {
      context.res = {
        status: 400,
        body: {
          success: false,
          error: "Missing required fields: campaign_name, slides",
        },
      };
      return;
    }

    const pptx = await generatePresentation(request);
    const buffer = await pptx.write({ outputType: "nodebuffer" }) as Buffer;
    const base64 = buffer.toString("base64");

    const filename = generateFilename(request);

    const response: PresentationResponse = {
      success: true,
      filename: filename,
      content_base64: base64,
      content_type:
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      slide_count: request.slides.length,
      generated_at: new Date().toISOString(),
    };

    context.res = {
      status: 200,
      body: response,
    };
  } catch (error) {
    context.log.error("Presentation generation failed:", error);
    context.res = {
      status: 500,
      body: {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
};

/**
 * Generate the presentation
 */
async function generatePresentation(
  request: PresentationRequest
): Promise<PptxGenJS> {
  const pptx = new PptxGenJS();

  // Set presentation properties
  pptx.layout = "LAYOUT_16x9";
  pptx.title = request.campaign_name;
  pptx.author = request.metadata?.author || "Kessel Digital Agent Platform";
  pptx.company = request.metadata?.company || request.client_name;
  pptx.subject = request.metadata?.subject || `${request.presentation_type} for ${request.campaign_name}`;

  // Apply branding colors
  const colors = request.branding
    ? {
        PRIMARY: request.branding.primary_color || COLORS.PRIMARY,
        SECONDARY: request.branding.secondary_color || COLORS.SECONDARY,
        ACCENT: request.branding.accent_color || COLORS.ACCENT,
      }
    : COLORS;

  // Define master slide
  pptx.defineSlideMaster({
    title: "KESSEL_MASTER",
    background: { color: "FFFFFF" },
    objects: [
      // Footer bar
      {
        rect: {
          x: 0,
          y: 6.8,
          w: "100%",
          h: 0.3,
          fill: { color: colors.PRIMARY },
        },
      },
      // Footer text
      {
        text: {
          text: `${request.client_name} | ${request.campaign_name}`,
          options: {
            x: 0.5,
            y: 6.85,
            w: 8,
            h: 0.2,
            fontSize: 8,
            color: COLORS.TEXT_LIGHT,
          },
        },
      },
      // Slide number placeholder
      {
        placeholder: {
          options: {
            name: "slideNumber",
            type: "slideNumber",
            x: 9,
            y: 6.85,
            w: 0.5,
            h: 0.2,
          },
          text: "",
        },
      },
    ],
  });

  // Generate slides
  for (const slideData of request.slides) {
    createSlide(pptx, slideData, colors);
  }

  return pptx;
}

/**
 * Create a slide based on slide type
 */
function createSlide(
  pptx: PptxGenJS,
  slideData: SlideData,
  colors: typeof COLORS
): void {
  const slide = pptx.addSlide({ masterName: "KESSEL_MASTER" });

  switch (slideData.type) {
    case "title":
      createTitleSlide(slide, slideData, colors);
      break;
    case "section_header":
      createSectionHeaderSlide(slide, slideData, colors);
      break;
    case "bullets":
      createBulletSlide(slide, slideData, colors);
      break;
    case "table":
      createTableSlide(slide, slideData, colors);
      break;
    case "two_column":
      createTwoColumnSlide(slide, slideData, colors);
      break;
    case "chart_placeholder":
      createChartPlaceholderSlide(slide, slideData, colors);
      break;
    default:
      createBulletSlide(slide, slideData, colors);
  }

  // Add speaker notes if provided
  if (slideData.notes) {
    slide.addNotes(slideData.notes);
  }
}

/**
 * Create title slide
 */
function createTitleSlide(
  slide: PptxGenJS.Slide,
  slideData: SlideData,
  colors: typeof COLORS
): void {
  // Background color bar
  slide.addShape("rect", {
    x: 0,
    y: 2.5,
    w: "100%",
    h: 2,
    fill: { color: colors.PRIMARY },
  });

  // Main title
  slide.addText(slideData.title, {
    x: 0.5,
    y: 2.8,
    w: 9,
    h: 0.8,
    fontSize: 36,
    bold: true,
    color: COLORS.TEXT_LIGHT,
    align: "center",
  });

  // Subtitle
  if (slideData.subtitle) {
    slide.addText(slideData.subtitle, {
      x: 0.5,
      y: 3.6,
      w: 9,
      h: 0.5,
      fontSize: 20,
      color: COLORS.TEXT_LIGHT,
      align: "center",
    });
  }

  // Date
  slide.addText(
    new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    {
      x: 0.5,
      y: 5,
      w: 9,
      h: 0.3,
      fontSize: 14,
      color: COLORS.TEXT_DARK,
      align: "center",
    }
  );
}

/**
 * Create section header slide
 */
function createSectionHeaderSlide(
  slide: PptxGenJS.Slide,
  slideData: SlideData,
  colors: typeof COLORS
): void {
  // Background
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: "100%",
    h: "100%",
    fill: { color: colors.PRIMARY },
  });

  // Section title
  slide.addText(slideData.title, {
    x: 0.5,
    y: 2.5,
    w: 9,
    h: 1,
    fontSize: 44,
    bold: true,
    color: COLORS.TEXT_LIGHT,
    align: "center",
  });

  // Section subtitle
  if (slideData.subtitle) {
    slide.addText(slideData.subtitle, {
      x: 0.5,
      y: 3.8,
      w: 9,
      h: 0.5,
      fontSize: 20,
      color: COLORS.TEXT_LIGHT,
      align: "center",
    });
  }
}

/**
 * Create bullet point slide
 */
function createBulletSlide(
  slide: PptxGenJS.Slide,
  slideData: SlideData,
  colors: typeof COLORS
): void {
  // Title
  slide.addText(slideData.title, {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.7,
    fontSize: 28,
    bold: true,
    color: colors.PRIMARY,
  });

  // Subtitle if present
  let contentY = 1.2;
  if (slideData.subtitle) {
    slide.addText(slideData.subtitle, {
      x: 0.5,
      y: 1.0,
      w: 9,
      h: 0.4,
      fontSize: 16,
      color: COLORS.TEXT_DARK,
    });
    contentY = 1.6;
  }

  // Bullet points
  const bulletPoints = slideData.content.map((text) => ({
    text: text,
    options: { bullet: true, indentLevel: 0 },
  }));

  slide.addText(bulletPoints, {
    x: 0.5,
    y: contentY,
    w: 9,
    h: 4.5,
    fontSize: 18,
    color: COLORS.TEXT_DARK,
    valign: "top",
  });
}

/**
 * Create table slide
 */
function createTableSlide(
  slide: PptxGenJS.Slide,
  slideData: SlideData,
  colors: typeof COLORS
): void {
  // Title
  slide.addText(slideData.title, {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.7,
    fontSize: 28,
    bold: true,
    color: colors.PRIMARY,
  });

  if (slideData.table_data && slideData.table_data.length > 0) {
    // Calculate column widths
    const numCols = slideData.table_data[0].length;
    const colWidth = 8.5 / numCols;

    // Create table with styling
    const tableRows = slideData.table_data.map((row, rowIndex) =>
      row.map((cell) => ({
        text: cell,
        options: {
          fill: rowIndex === 0 ? colors.TABLE_HEADER : rowIndex % 2 === 0 ? "FFFFFF" : colors.TABLE_ROW_ALT,
          color: rowIndex === 0 ? COLORS.TEXT_LIGHT : COLORS.TEXT_DARK,
          bold: rowIndex === 0,
          align: "left" as const,
          valign: "middle" as const,
        },
      }))
    );

    slide.addTable(tableRows, {
      x: 0.5,
      y: 1.3,
      w: 9,
      colW: Array(numCols).fill(colWidth),
      fontSize: 12,
      border: { pt: 0.5, color: "CFCFCF" },
      autoPage: true,
    });
  }
}

/**
 * Create two-column slide
 */
function createTwoColumnSlide(
  slide: PptxGenJS.Slide,
  slideData: SlideData,
  colors: typeof COLORS
): void {
  // Title
  slide.addText(slideData.title, {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.7,
    fontSize: 28,
    bold: true,
    color: colors.PRIMARY,
  });

  // Left column
  if (slideData.left_column) {
    const leftBullets = slideData.left_column.map((text) => ({
      text: text,
      options: { bullet: true, indentLevel: 0 },
    }));

    slide.addText(leftBullets, {
      x: 0.5,
      y: 1.3,
      w: 4.2,
      h: 4.5,
      fontSize: 16,
      color: COLORS.TEXT_DARK,
      valign: "top",
    });
  }

  // Divider line
  slide.addShape("line", {
    x: 4.85,
    y: 1.3,
    w: 0,
    h: 4.5,
    line: { color: colors.PRIMARY, width: 1 },
  });

  // Right column
  if (slideData.right_column) {
    const rightBullets = slideData.right_column.map((text) => ({
      text: text,
      options: { bullet: true, indentLevel: 0 },
    }));

    slide.addText(rightBullets, {
      x: 5.1,
      y: 1.3,
      w: 4.2,
      h: 4.5,
      fontSize: 16,
      color: COLORS.TEXT_DARK,
      valign: "top",
    });
  }
}

/**
 * Create chart placeholder slide
 */
function createChartPlaceholderSlide(
  slide: PptxGenJS.Slide,
  slideData: SlideData,
  colors: typeof COLORS
): void {
  // Title
  slide.addText(slideData.title, {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.7,
    fontSize: 28,
    bold: true,
    color: colors.PRIMARY,
  });

  // Chart placeholder box
  slide.addShape("rect", {
    x: 0.5,
    y: 1.3,
    w: 9,
    h: 4.5,
    fill: { color: COLORS.BACKGROUND },
    line: { color: "CCCCCC", width: 1, dashType: "dash" },
  });

  // Placeholder text
  slide.addText("[Chart will be inserted here]", {
    x: 0.5,
    y: 3.3,
    w: 9,
    h: 0.5,
    fontSize: 16,
    color: "888888",
    align: "center",
    italic: true,
  });

  // Key points below chart area
  if (slideData.content && slideData.content.length > 0) {
    slide.addText("Key Takeaways:", {
      x: 0.5,
      y: 6,
      w: 9,
      h: 0.3,
      fontSize: 14,
      bold: true,
      color: colors.PRIMARY,
    });

    const takeaways = slideData.content.slice(0, 3).join(" | ");
    slide.addText(takeaways, {
      x: 0.5,
      y: 6.3,
      w: 9,
      h: 0.3,
      fontSize: 12,
      color: COLORS.TEXT_DARK,
    });
  }
}

/**
 * Generate filename for the presentation
 */
function generateFilename(request: PresentationRequest): string {
  const sanitizedName = request.campaign_name
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, "_");
  const dateStr = new Date().toISOString().split("T")[0];
  return `${sanitizedName}_${request.presentation_type}_${dateStr}.pptx`;
}

export default httpTrigger;
