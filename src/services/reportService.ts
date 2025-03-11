import { ModelService } from './modelService';
import * as docx from 'docx';
import { saveAs } from 'file-saver';

export interface ReportConfig {
  title: string;
  sections: string[];
  style?: 'formal' | 'casual' | 'technical';
  format?: 'detailed' | 'summary' | 'bullet-points';
}

export class ReportService {
  private modelService: ModelService;

  constructor(modelService: ModelService) {
    this.modelService = modelService;
  }

  async generateReport(prompt: string, config: ReportConfig): Promise<string> {
    try {
      const reportPrompt = this.createReportPrompt(prompt, config);
      const report = await this.modelService.generateChat([
        {
          role: 'system',
          content: 'You are a professional report writer. Generate a well-structured report based on the given prompt and requirements.'
        },
        {
          role: 'user',
          content: reportPrompt
        }
      ]);

      return report;
    } catch (error) {
      console.error('Error generating report:', error);
      throw new Error('Failed to generate report');
    }
  }

  private createReportPrompt(prompt: string, config: ReportConfig): string {
    return `
Please generate a ${config.style || 'formal'} report with the following requirements:

Title: ${config.title}

Sections to include:
${config.sections.map(section => `- ${section}`).join('\n')}

Format: ${config.format || 'detailed'}

Additional requirements:
- Use professional language
- Include relevant headings and subheadings
- Maintain consistent formatting
- Provide actionable insights where applicable

Topic/Request: ${prompt}

Please structure the report in a clear, organized manner suitable for export to a Word document.
    `.trim();
  }

  async exportToWord(report: string, title: string): Promise<void> {
    try {
      // Parse the report content (assuming markdown-like format)
      const sections = this.parseReportSections(report);
      
      // Create a new Word document
      const doc = new docx.Document({
        sections: [{
          properties: {},
          children: [
            new docx.Paragraph({
              text: title,
              heading: docx.HeadingLevel.TITLE,
              spacing: { after: 400 }
            }),
            ...this.convertSectionsToDocx(sections)
          ]
        }]
      });

      // Generate and save the document
      docx.Packer.toBlob(doc).then((blob: Blob) => {
        saveAs(blob, `${title.replace(/[^a-zA-Z0-9]/g, '_')}.docx`);
      });
    } catch (error) {
      console.error('Error exporting to Word:', error);
      throw new Error('Failed to export report to Word format');
    }
  }

  private parseReportSections(report: string): Array<{ heading: string; content: string }> {
    const sections: Array<{ heading: string; content: string }> = [];
    const lines = report.split('\n');
    let currentSection: { heading: string; content: string } | null = null;

    for (const line of lines) {
      if (line.startsWith('#')) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          heading: line.replace(/^#+\s/, ''),
          content: ''
        };
      } else if (currentSection) {
        currentSection.content += line + '\n';
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  }

  private convertSectionsToDocx(sections: Array<{ heading: string; content: string }>): docx.Paragraph[] {
    const paragraphs: docx.Paragraph[] = [];

    for (const section of sections) {
      paragraphs.push(
        new docx.Paragraph({
          text: section.heading,
          heading: docx.HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 }
        })
      );

      const contentParagraphs = section.content
        .split('\n\n')
        .filter(para => para.trim())
        .map(para => new docx.Paragraph({
          text: para.trim(),
          spacing: { before: 200, after: 200 }
        }));

      paragraphs.push(...contentParagraphs);
    }

    return paragraphs;
  }
} 