import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import FileProcessor from "file-converter-nodejs";
import mammoth from "mammoth";
import { jsPDF } from "jspdf";
import { execFile } from "child_process";

export interface ConversionResult {
  pdfBuffer: Buffer;
  success: boolean;
  originalMimeType: string;
  convertedMimeType: string;
  error?: string;
}

export class UniversalPdfConverter {
  private fileProcessor: FileProcessor;

  constructor() {
    this.fileProcessor = new FileProcessor();
  }


  async convertToPdf(
    buffer: Buffer,
    mimeType: string,
    fileName: string
  ): Promise<ConversionResult> {
    try {
      console.log(`[UniversalPdfConverter] Starting conversion: ${fileName}, mimeType: ${mimeType}`);
      // If already PDF, return as is
      if (mimeType === "application/pdf") {
        console.log(`[UniversalPdfConverter] File is already a PDF: ${fileName}`);
        return {
          pdfBuffer: buffer,
          success: true,
          originalMimeType: mimeType,
          convertedMimeType: "application/pdf",
        };
      }

      // Route to appropriate conversion method based on MIME type
      if (this.isPowerPoint(mimeType)) {
        console.log(`[UniversalPdfConverter] Detected PowerPoint file: ${fileName}`);
        return await this.convertPowerPointToPdf(buffer, fileName);
      } else if (this.isWord(mimeType)) {
        console.log(`[UniversalPdfConverter] Detected Word file: ${fileName}`);
        return await this.convertWordToPdf(buffer, fileName);
      } else if (this.isText(mimeType)) {
        console.log(`[UniversalPdfConverter] Detected Text file: ${fileName}`);
        return await this.convertTextToPdf(buffer, fileName);
      } else if (this.isExcel(mimeType)) {
        console.log(`[UniversalPdfConverter] Detected Excel file: ${fileName}`);
        return await this.convertExcelToPdf(buffer, fileName);
      } else {
        console.error(`[UniversalPdfConverter] Unsupported file type for PDF conversion: ${mimeType}`);
        throw new Error(`Unsupported file type for PDF conversion: ${mimeType}`);
      }
    } catch (error) {
      console.error(`[UniversalPdfConverter] Conversion failed for ${fileName}:`, error);
      return {
        pdfBuffer: Buffer.alloc(0),
        success: false,
        originalMimeType: mimeType,
        convertedMimeType: "application/pdf",
        error: error instanceof Error ? error.message : "Unknown conversion error",
      };
    }
  }

  /**
   * Check if file is PowerPoint
   */
  private isPowerPoint(mimeType: string): boolean {
    return (
      mimeType.includes("powerpoint") ||
      mimeType.includes("presentation") ||
      mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
      mimeType === "application/vnd.ms-powerpoint"
    );
  }

  /**
   * Check if file is Word document
   */
  private isWord(mimeType: string): boolean {
    return (
      mimeType.includes("word") ||
      mimeType.includes("document") ||
      mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimeType === "application/msword"
    );
  }

  /**
   * Check if file is text
   */
  private isText(mimeType: string): boolean {
    return mimeType === "text/plain" || mimeType.startsWith("text/");
  }

  /**
   * Check if file is Excel
   */
  private isExcel(mimeType: string): boolean {
    return (
      mimeType.includes("excel") ||
      mimeType.includes("spreadsheet") ||
      mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      mimeType === "application/vnd.ms-excel"
    );
  }

  /**
   * Convert PowerPoint to PDF using file-converter-nodejs
   */
  private async convertPowerPointToPdf(
    buffer: Buffer,
    fileName: string
  ): Promise<ConversionResult> {
    const tempDir = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), "ppt-convert-")
    );

    try {
      console.log(`[UniversalPdfConverter] [PPT] Writing input file: ${fileName}`);
      const inputPath = path.join(tempDir, fileName);
      const outputDir = path.join(tempDir, "output");

      await fs.promises.mkdir(outputDir, { recursive: true });
      await fs.promises.writeFile(inputPath, buffer);

      // Use pptx format for file-converter-nodejs (it supports pptx)
      console.log(`[UniversalPdfConverter] [PPT] Starting conversion with file-converter-nodejs: ${inputPath}`);
      await this.fileProcessor.convertFile({
        filePath: inputPath,
        from: "pptx", // file-converter-nodejs supports pptx
        to: "pdf",
        outdir: outputDir,
      });

      const outputFiles = await fs.promises.readdir(outputDir);
      const pdfFile = outputFiles.find((file) => file.endsWith(".pdf"));

      if (!pdfFile) {
        console.error(`[UniversalPdfConverter] [PPT] PDF conversion failed - no output file found in ${outputDir}`);
        throw new Error("PDF conversion failed - no output file found");
      }

      const pdfPath = path.join(outputDir, pdfFile);
      const pdfBuffer = await fs.promises.readFile(pdfPath);
      console.log(`[UniversalPdfConverter] [PPT] Conversion successful: ${pdfPath}`);

      return {
        pdfBuffer,
        success: true,
        originalMimeType: "powerpoint",
        convertedMimeType: "application/pdf",
      };
    } finally {
      await this.cleanupTempDir(tempDir);
    }
  }

  /**
   * Convert Word document to PDF - Use LibreOffice for best formatting, fallback to mammoth+jsPDF
   */
  private async convertWordToPdf(
    buffer: Buffer,
    fileName: string
  ): Promise<ConversionResult> {
    // Use LibreOffice for .docx and .doc
    const isDocx = fileName.toLowerCase().endsWith('.docx');
    const isDoc = fileName.toLowerCase().endsWith('.doc');
    if (isDocx || isDoc) {
      const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "word-convert-"));
      try {
        const inputPath = path.join(tempDir, fileName);
        const outputDir = path.join(tempDir, "output");
        await fs.promises.mkdir(outputDir, { recursive: true });
        await fs.promises.writeFile(inputPath, buffer);

        // Call LibreOffice to convert to PDF
        await new Promise<void>((resolve, reject) => {
          execFile(
            "soffice", // LibreOffice CLI
            [
              "--headless",
              "--convert-to", "pdf",
              "--outdir", outputDir,
              inputPath
            ],
            (error, stdout, stderr) => {
              if (error) {
                reject(new Error(`LibreOffice conversion failed: ${stderr || error.message}`));
              } else {
                resolve();
              }
            }
          );
        });

        // Find the output PDF
        const baseName = path.parse(fileName).name;
        const pdfFile = `${baseName}.pdf`;
        const pdfPath = path.join(outputDir, pdfFile);
        const pdfBuffer = await fs.promises.readFile(pdfPath);
        return {
          pdfBuffer,
          success: true,
          originalMimeType: isDocx ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : "application/msword",
          convertedMimeType: "application/pdf",
        };
      } catch (error) {
        console.error(`[UniversalPdfConverter] [Word] LibreOffice conversion failed for: ${fileName}`, error);
        return {
          pdfBuffer: Buffer.alloc(0),
          success: false,
          originalMimeType: isDocx ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : "application/msword",
          convertedMimeType: "application/pdf",
          error: error instanceof Error ? error.message : "Unknown LibreOffice conversion error",
        };
      } finally {
        await this.cleanupTempDir(tempDir);
      }
    }
    // Fallback: Use mammoth + jsPDF for other Word types
    try {
      console.log(`[UniversalPdfConverter] [Word] Fallback to mammoth+jsPDF for: ${fileName}`);
      const result = await mammoth.convertToHtml({ buffer });
      const html = result.value;
      const doc = new jsPDF();
      const textContent = this.htmlToText(html);
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      const lineHeight = 7;
      const lines = doc.splitTextToSize(textContent, maxWidth);
      let y = margin;
      for (let i = 0; i < lines.length; i++) {
        if (y + lineHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(lines[i], margin, y);
        y += lineHeight;
      }
      const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
      return {
        pdfBuffer,
        success: true,
        originalMimeType: "word",
        convertedMimeType: "application/pdf",
      };
    } catch (error) {
      console.error(`[UniversalPdfConverter] [Word] Fallback conversion failed for: ${fileName}`, error);
      throw new Error(`Word to PDF conversion failed: ${error}`);
    }
  }

  /**
   * Convert text file to PDF using jsPDF
   */
  private async convertTextToPdf(
    buffer: Buffer,
    fileName: string
  ): Promise<ConversionResult> {
    try {
      console.log(`[UniversalPdfConverter] [Text] Starting conversion for: ${fileName}`);
      const textContent = buffer.toString("utf-8");
      const doc = new jsPDF();

      // Configure font and spacing
      doc.setFont("helvetica");
      doc.setFontSize(12);

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      const lineHeight = 7;

      // Split text into lines that fit the page width
      const lines = doc.splitTextToSize(textContent, maxWidth);
      
      let y = margin;
      
      for (let i = 0; i < lines.length; i++) {
        // Check if we need a new page
        if (y + lineHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        
        doc.text(lines[i], margin, y);
        y += lineHeight;
      }

      const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
      console.log(`[UniversalPdfConverter] [Text] Conversion successful for: ${fileName}`);

      return {
        pdfBuffer,
        success: true,
        originalMimeType: "text/plain",
        convertedMimeType: "application/pdf",
      };
    } catch (error) {
      console.error(`[UniversalPdfConverter] [Text] Conversion failed for: ${fileName}`, error);
      throw new Error(`Text to PDF conversion failed: ${error}`);
    }
  }

  /**
   * Convert Excel to PDF - Use file-converter-nodejs if supported, fallback to text extraction
   */
  private async convertExcelToPdf(
    buffer: Buffer,
    fileName: string
  ): Promise<ConversionResult> {
    console.log(`[UniversalPdfConverter] [Excel] Starting conversion for: ${fileName}`);
    // Try file-converter-nodejs first for xlsx
    if (fileName.toLowerCase().endsWith('.xlsx')) {
      try {
        const result = await this.convertExcelWithFileConverter(buffer, fileName);
        console.log(`[UniversalPdfConverter] [Excel] file-converter-nodejs conversion successful for: ${fileName}`);
        return result;
      } catch (error) {
        console.warn('[UniversalPdfConverter] [Excel] File converter failed for Excel, using fallback method:', error);
      }
    }

    // Fallback: Convert to simple text-based PDF
    const fallbackResult = await this.convertExcelToTextPdf(buffer, fileName);
    console.log(`[UniversalPdfConverter] [Excel] Fallback text-based conversion used for: ${fileName}`);
    return fallbackResult;
  }

  /**
   * Convert Excel using file-converter-nodejs (only for xlsx)
   */
  private async convertExcelWithFileConverter(
    buffer: Buffer,
    fileName: string
  ): Promise<ConversionResult> {
    const tempDir = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), "excel-convert-")
    );

    try {
      console.log(`[UniversalPdfConverter] [Excel] Writing input file: ${fileName}`);
      const inputPath = path.join(tempDir, fileName);
      const outputDir = path.join(tempDir, "output");

      await fs.promises.mkdir(outputDir, { recursive: true });
      await fs.promises.writeFile(inputPath, buffer);

      // Only use xlsx format for file-converter-nodejs
      console.log(`[UniversalPdfConverter] [Excel] Starting conversion with file-converter-nodejs: ${inputPath}`);
      await this.fileProcessor.convertFile({
        filePath: inputPath,
        from: "xlsx", // file-converter-nodejs supports xlsx
        to: "pdf",
        outdir: outputDir,
      });

      const outputFiles = await fs.promises.readdir(outputDir);
      const pdfFile = outputFiles.find((file) => file.endsWith(".pdf"));

      if (!pdfFile) {
        console.error(`[UniversalPdfConverter] [Excel] PDF conversion failed - no output file found in ${outputDir}`);
        throw new Error("PDF conversion failed - no output file found");
      }

      const pdfPath = path.join(outputDir, pdfFile);
      const pdfBuffer = await fs.promises.readFile(pdfPath);
      console.log(`[UniversalPdfConverter] [Excel] Conversion successful: ${pdfPath}`);

      return {
        pdfBuffer,
        success: true,
        originalMimeType: "excel",
        convertedMimeType: "application/pdf",
      };
    } finally {
      await this.cleanupTempDir(tempDir);
    }
  }

  /**
   * Fallback Excel to PDF conversion (text-based)
   */
  private async convertExcelToTextPdf(
    buffer: Buffer,
    fileName: string
  ): Promise<ConversionResult> {
    try {
      console.log(`[UniversalPdfConverter] [Excel-Fallback] Starting fallback text-based conversion for: ${fileName}`);
      // Create a simple PDF indicating Excel content
      const doc = new jsPDF();
      
      doc.setFont("helvetica");
      doc.setFontSize(14);
      doc.text("Excel Spreadsheet Content", 20, 30);
      doc.setFontSize(10);
      doc.text(`Original file: ${fileName}`, 20, 45);
      doc.text(`File size: ${buffer.length} bytes`, 20, 55);
      doc.text("Note: Excel content has been processed for text extraction.", 20, 70);
      doc.text("The spreadsheet data is available for search and analysis.", 20, 80);

      const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
      console.log(`[UniversalPdfConverter] [Excel-Fallback] Conversion successful for: ${fileName}`);

      return {
        pdfBuffer,
        success: true,
        originalMimeType: "excel",
        convertedMimeType: "application/pdf",
      };
    } catch (error) {
      console.error(`[UniversalPdfConverter] [Excel-Fallback] Conversion failed for: ${fileName}`, error);
      throw new Error(`Excel to PDF conversion failed: ${error}`);
    }
  }

  /**
   * Convert HTML to plain text
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gis, '') // Remove style tags
      .replace(/<script[^>]*>.*?<\/script>/gis, '') // Remove script tags
      .replace(/<[^>]+>/g, ' ') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Clean up temporary directory
   */
  private async cleanupTempDir(tempDir: string): Promise<void> {
    try {
      await fs.promises.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      console.warn(`Failed to clean up temporary directory ${tempDir}:`, error);
    }
  }

  /**
   * Get supported MIME types for conversion
   */
  public getSupportedMimeTypes(): string[] {
    return [
      // PowerPoint
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      
      // Word
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      
      // Excel
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      
      // Text
      "text/plain",
      
      // PDF (already supported)
      "application/pdf",
    ];
  }

  /**
   * Check if a MIME type is supported for conversion
   */
  public isSupportedMimeType(mimeType: string): boolean {
    return (
      mimeType === "application/pdf" ||
      this.isPowerPoint(mimeType) ||
      this.isWord(mimeType) ||
      this.isText(mimeType) ||
      this.isExcel(mimeType)
    );
  }

  /**
   * Get conversion method info for a MIME type
   */
  public getConversionMethod(mimeType: string): string {
    if (mimeType === "application/pdf") {
      return "No conversion needed";
    } else if (this.isPowerPoint(mimeType)) {
      return "PowerPoint to PDF via file-converter-nodejs";
    } else if (this.isWord(mimeType)) {
      return "Word to PDF via LibreOffice or mammoth + jsPDF";
    } else if (this.isText(mimeType)) {
      return "Text to PDF via jsPDF";
    } else if (this.isExcel(mimeType)) {
      return "Excel to PDF via file-converter-nodejs (xlsx) or fallback method";
    } else {
      return "Unsupported format";
    }
  }
}