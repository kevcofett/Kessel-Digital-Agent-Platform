/**
 * Document Generator Azure Function
 *
 * Generates Word documents (DOCX) for media plans, executive summaries,
 * channel briefs, and post-mortem reports using the docx library.
 *
 * @module document-generator
 * @version 1.0.0
 * @agent DOC (Document Generation)
 */

import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  PageBreak,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
} from "docx";

/**
 * Document request interface
 */
interface DocumentRequest {
  session_id: string;
  request_id: string;
  document_type: "FULL_PLAN" | "EXECUTIVE_SUMMARY" | "CHANNEL_BRIEF" | "POST_MORTEM" | "MEASUREMENT_PLAN";
  campaign_name: string;
  client_name: string;
  sections: DocumentSection[];
  branding?: BrandingConfig;
  metadata?: DocumentMetadata;
}

interface DocumentSection {
  title: string;
  content: string;
  type: "paragraph" | "table" | "bullets" | "numbered" | "key_metrics";
  table_data?: string[][];
  bullet_points?: string[];
  metrics?: MetricItem[];
}

interface MetricItem {
  label: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "flat";
}

interface BrandingConfig {
  primary_color?: string;
  secondary_color?: string;
  logo_url?: string;
  footer_text?: string;
}

interface DocumentMetadata {
  prepared_by?: string;
  prepared_for?: string;
  version?: string;
  confidentiality?: string;
}

/**
 * Document response interface
 */
interface DocumentResponse {
  success: boolean;
  filename: string;
  content_base64: string;
  content_type: string;
  page_count?: number;
  generated_at: string;
}

/**
 * Color configuration for document styling
 */
const COLORS = {
  PRIMARY: "4472C4",
  SECONDARY: "5B9BD5",
  HEADER_BG: "4472C4",
  HEADER_TEXT: "FFFFFF",
  ROW_ALT: "D6DCE5",
  TEXT: "363636",
  ACCENT: "70AD47",
};

/**
 * Main Azure Function handler
 */
const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log("Document Generator function processing request");

  try {
    const request: DocumentRequest = req.body;

    if (!request || !request.document_type || !request.campaign_name) {
      context.res = {
        status: 400,
        body: {
          success: false,
          error: "Missing required fields: document_type, campaign_name",
        },
      };
      return;
    }

    const doc = await generateDocument(request);
    const buffer = await Packer.toBuffer(doc);
    const base64 = buffer.toString("base64");

    const filename = generateFilename(request);

    const response: DocumentResponse = {
      success: true,
      filename: filename,
      content_base64: base64,
      content_type:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      generated_at: new Date().toISOString(),
    };

    context.res = {
      status: 200,
      body: response,
    };
  } catch (error) {
    context.log.error("Document generation failed:", error);
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
 * Generate the document based on request type
 */
async function generateDocument(request: DocumentRequest): Promise<Document> {
  const children: (Paragraph | Table)[] = [];

  // Add title page
  children.push(...createTitlePage(request));

  // Add page break after title
  children.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  // Add table of contents placeholder for full plans
  if (request.document_type === "FULL_PLAN") {
    children.push(...createTableOfContents());
    children.push(
      new Paragraph({
        children: [new PageBreak()],
      })
    );
  }

  // Add sections
  for (const section of request.sections) {
    children.push(...createSection(section));
  }

  // Add footer with metadata
  if (request.metadata?.confidentiality) {
    children.push(
      new Paragraph({
        text: request.metadata.confidentiality,
        alignment: AlignmentType.CENTER,
        spacing: { before: 400 },
      })
    );
  }

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: request.campaign_name,
                    size: 20,
                    color: COLORS.TEXT,
                  }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Generated by Kessel Digital Agent Platform | ",
                    size: 18,
                    color: "888888",
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 18,
                    color: "888888",
                  }),
                  new TextRun({
                    text: " of ",
                    size: 18,
                    color: "888888",
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 18,
                    color: "888888",
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
        children: children,
      },
    ],
  });
}

/**
 * Create title page elements
 */
function createTitlePage(request: DocumentRequest): Paragraph[] {
  const documentTypeLabels: Record<string, string> = {
    FULL_PLAN: "Media Plan",
    EXECUTIVE_SUMMARY: "Executive Summary",
    CHANNEL_BRIEF: "Channel Brief",
    POST_MORTEM: "Campaign Post-Mortem",
    MEASUREMENT_PLAN: "Measurement Plan",
  };

  return [
    new Paragraph({
      spacing: { before: 2000 },
    }),
    new Paragraph({
      text: request.campaign_name,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: documentTypeLabels[request.document_type] || request.document_type,
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 },
      children: [
        new TextRun({
          text:
            documentTypeLabels[request.document_type] || request.document_type,
          size: 36,
          color: COLORS.PRIMARY,
        }),
      ],
    }),
    new Paragraph({
      text: `Prepared for: ${request.client_name}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: `Date: ${new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    ...(request.metadata?.prepared_by
      ? [
          new Paragraph({
            text: `Prepared by: ${request.metadata.prepared_by}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
        ]
      : []),
    ...(request.metadata?.version
      ? [
          new Paragraph({
            text: `Version: ${request.metadata.version}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
        ]
      : []),
  ];
}

/**
 * Create table of contents placeholder
 */
function createTableOfContents(): Paragraph[] {
  return [
    new Paragraph({
      text: "Table of Contents",
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 400 },
    }),
    new Paragraph({
      text: "[Table of contents will be generated when document is opened in Word]",
      spacing: { after: 200 },
      children: [
        new TextRun({
          text:
            "[Table of contents will be generated when document is opened in Word]",
          italics: true,
          color: "888888",
        }),
      ],
    }),
  ];
}

/**
 * Create a document section
 */
function createSection(section: DocumentSection): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  // Section title
  elements.push(
    new Paragraph({
      text: section.title,
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    })
  );

  // Section content based on type
  switch (section.type) {
    case "paragraph":
      elements.push(
        new Paragraph({
          text: section.content,
          spacing: { after: 200 },
        })
      );
      break;

    case "bullets":
      if (section.bullet_points) {
        for (const point of section.bullet_points) {
          elements.push(
            new Paragraph({
              text: point,
              bullet: { level: 0 },
              spacing: { after: 100 },
            })
          );
        }
      } else if (section.content) {
        // Parse content as bullet points
        const points = section.content.split("\n").filter((p) => p.trim());
        for (const point of points) {
          elements.push(
            new Paragraph({
              text: point.replace(/^[-•]\s*/, ""),
              bullet: { level: 0 },
              spacing: { after: 100 },
            })
          );
        }
      }
      break;

    case "numbered":
      if (section.bullet_points) {
        section.bullet_points.forEach((point, index) => {
          elements.push(
            new Paragraph({
              text: `${index + 1}. ${point}`,
              spacing: { after: 100 },
            })
          );
        });
      }
      break;

    case "table":
      if (section.table_data && section.table_data.length > 0) {
        elements.push(createTable(section.table_data));
      }
      break;

    case "key_metrics":
      if (section.metrics) {
        elements.push(createMetricsTable(section.metrics));
      }
      break;
  }

  return elements;
}

/**
 * Create a formatted table
 */
function createTable(data: string[][]): Table {
  const rows = data.map((rowData, rowIndex) =>
    new TableRow({
      children: rowData.map(
        (cellText) =>
          new TableCell({
            children: [
              new Paragraph({
                text: cellText,
                alignment: AlignmentType.LEFT,
              }),
            ],
            shading:
              rowIndex === 0 ? { fill: COLORS.HEADER_BG } : undefined,
            margins: {
              top: 100,
              bottom: 100,
              left: 100,
              right: 100,
            },
          })
      ),
      tableHeader: rowIndex === 0,
    })
  );

  return new Table({
    rows: rows,
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
  });
}

/**
 * Create a metrics summary table
 */
function createMetricsTable(metrics: MetricItem[]): Table {
  const headerRow = new TableRow({
    children: [
      new TableCell({
        children: [
          new Paragraph({
            text: "Metric",
            alignment: AlignmentType.LEFT,
            children: [
              new TextRun({ text: "Metric", bold: true, color: COLORS.HEADER_TEXT }),
            ],
          }),
        ],
        shading: { fill: COLORS.HEADER_BG },
        margins: { top: 100, bottom: 100, left: 100, right: 100 },
      }),
      new TableCell({
        children: [
          new Paragraph({
            text: "Value",
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: "Value", bold: true, color: COLORS.HEADER_TEXT }),
            ],
          }),
        ],
        shading: { fill: COLORS.HEADER_BG },
        margins: { top: 100, bottom: 100, left: 100, right: 100 },
      }),
      new TableCell({
        children: [
          new Paragraph({
            text: "Trend",
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Trend", bold: true, color: COLORS.HEADER_TEXT }),
            ],
          }),
        ],
        shading: { fill: COLORS.HEADER_BG },
        margins: { top: 100, bottom: 100, left: 100, right: 100 },
      }),
    ],
    tableHeader: true,
  });

  const dataRows = metrics.map(
    (metric, index) =>
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                text: metric.label,
                alignment: AlignmentType.LEFT,
              }),
            ],
            shading: index % 2 === 1 ? { fill: COLORS.ROW_ALT } : undefined,
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
          }),
          new TableCell({
            children: [
              new Paragraph({
                text: `${metric.value}${metric.unit ? ` ${metric.unit}` : ""}`,
                alignment: AlignmentType.RIGHT,
              }),
            ],
            shading: index % 2 === 1 ? { fill: COLORS.ROW_ALT } : undefined,
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
          }),
          new TableCell({
            children: [
              new Paragraph({
                text: getTrendSymbol(metric.trend),
                alignment: AlignmentType.CENTER,
              }),
            ],
            shading: index % 2 === 1 ? { fill: COLORS.ROW_ALT } : undefined,
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
          }),
        ],
      })
  );

  return new Table({
    rows: [headerRow, ...dataRows],
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
  });
}

/**
 * Get trend symbol for metrics
 */
function getTrendSymbol(trend?: "up" | "down" | "flat"): string {
  switch (trend) {
    case "up":
      return "↑ Improving";
    case "down":
      return "↓ Declining";
    case "flat":
      return "→ Stable";
    default:
      return "-";
  }
}

/**
 * Generate filename for the document
 */
function generateFilename(request: DocumentRequest): string {
  const sanitizedName = request.campaign_name
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, "_");
  const dateStr = new Date().toISOString().split("T")[0];
  return `${sanitizedName}_${request.document_type}_${dateStr}.docx`;
}

export default httpTrigger;
