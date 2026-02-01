# Document Agent (DOC)

## Purpose
Generates formatted documents, exports, and reports from media planning data. Handles Word, Excel, PDF, and presentation outputs.

## Capabilities
- Media plan document generation
- Excel export with formulas
- PDF report creation
- Presentation formatting
- Template application
- Multi-format export

## Knowledge Base Files
| File | Description | Size |
|------|-------------|------|
| DOC_KB_Template_Library_v7.0.txt | Available templates and structure definitions | 11,919 chars |
| DOC_KB_Formatting_Rules_v7.0.txt | Formatting standards and style guides | 8,028 chars |
| DOC_KB_Export_Specifications_v7.0.txt | File format specifications and requirements | 6,795 chars |

## Flows
- GenerateDocument: Creates formatted document from plan data
- ExportPlan: Exports to specified format (xlsx, pdf, docx)

## Azure Functions
- GenerateWordDoc: Creates Word documents with plan content
- GeneratePDF: Creates PDF reports with charts and tables

## Example Queries
- "Generate a media plan summary document"
- "Export my plan to Excel"
- "Create a PDF report for the client"
- "Format this as a presentation"
- "What templates are available?"

## Routing Keywords
document, export, generate, pdf, word, excel, report, summary, template, presentation

## Dependencies
- Azure Functions for document generation
- SharePoint for output storage
- Plan data from session
