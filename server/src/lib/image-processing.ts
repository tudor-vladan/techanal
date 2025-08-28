import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
  filename: string;
}

export interface ProcessedImage {
  originalPath: string;
  processedPath: string;
  metadata: ImageMetadata;
  thumbnailPath?: string;
}

export class ImageProcessingError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'ImageProcessingError';
  }
}

export class ImageProcessor {
  private readonly uploadDir = './uploads';
  private readonly processedDir = './processed';
  private readonly thumbnailDir = './thumbnails';
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB
  private readonly maxDimensions = { width: 4000, height: 4000 };
  private readonly minDimensions = { width: 100, height: 100 };
  private readonly allowedFormats = ['jpeg', 'jpg', 'png', 'webp'];

  constructor() {
    this.ensureDirectories();
  }

  private async ensureDirectories(): Promise<void> {
    const dirs = [this.uploadDir, this.processedDir, this.thumbnailDir];
    for (const dir of dirs) {
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
      }
    }
  }

  async validateImage(file: { buffer: Buffer; size: number; originalname: string }): Promise<void> {
    // Check file size
    if (file.size > this.maxFileSize) {
      throw new ImageProcessingError(
        `File size ${file.size} bytes exceeds maximum allowed size of ${this.maxFileSize} bytes`,
        'FILE_TOO_LARGE'
      );
    }

    // Check file format
    const fileExtension = path.extname(file.originalname).toLowerCase().slice(1);
    if (!this.allowedFormats.includes(fileExtension)) {
      throw new ImageProcessingError(
        `File format ${fileExtension} is not allowed. Allowed formats: ${this.allowedFormats.join(', ')}`,
        'INVALID_FORMAT'
      );
    }

    // Validate image dimensions and format using Sharp
    try {
      const metadata = await sharp(file.buffer).metadata();
      
      if (!metadata.width || !metadata.height) {
        throw new ImageProcessingError('Unable to determine image dimensions', 'INVALID_IMAGE');
      }

      if (metadata.width < this.minDimensions.width || metadata.height < this.minDimensions.height) {
        throw new ImageProcessingError(
          `Image dimensions ${metadata.width}x${metadata.height} are below minimum ${this.minDimensions.width}x${this.minDimensions.height}`,
          'DIMENSIONS_TOO_SMALL'
        );
      }

      if (metadata.width > this.maxDimensions.width || metadata.height > this.maxDimensions.height) {
        throw new ImageProcessingError(
          `Image dimensions ${metadata.width}x${metadata.height} exceed maximum ${this.maxDimensions.width}x${this.maxDimensions.height}`,
          'DIMENSIONS_TOO_LARGE'
        );
      }

      if (!metadata.format || !this.allowedFormats.includes(metadata.format)) {
        throw new ImageProcessingError(
          `Image format ${metadata.format} is not supported`,
          'UNSUPPORTED_FORMAT'
        );
      }
    } catch (error) {
      if (error instanceof ImageProcessingError) {
        throw error;
      }
      throw new ImageProcessingError(
        'Failed to validate image file',
        'VALIDATION_FAILED'
      );
    }
  }

  async processImage(file: { buffer: Buffer; size: number; originalname: string }): Promise<ProcessedImage> {
    const filename = `${uuidv4()}-${Date.now()}`;
    const originalPath = path.join(this.uploadDir, `${filename}.${path.extname(file.originalname)}`);
    const processedPath = path.join(this.processedDir, `${filename}.webp`);
    const thumbnailPath = path.join(this.thumbnailDir, `${filename}-thumb.webp`);

    try {
      // Save original file
      await fs.writeFile(originalPath, file.buffer);

      // Process and optimize image
      const processedBuffer = await sharp(file.buffer)
        .webp({ quality: 85, effort: 6 })
        .resize(1920, 1080, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .toBuffer();

      await fs.writeFile(processedPath, processedBuffer);

      // Create thumbnail
      const thumbnailBuffer = await sharp(file.buffer)
        .webp({ quality: 70, effort: 4 })
        .resize(400, 300, { 
          fit: 'cover',
          position: 'center'
        })
        .toBuffer();

      await fs.writeFile(thumbnailPath, thumbnailBuffer);

      // Get metadata
      const metadata = await sharp(file.buffer).metadata();
      
      const imageMetadata: ImageMetadata = {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        size: file.size,
        filename: file.originalname
      };

      return {
        originalPath,
        processedPath,
        thumbnailPath,
        metadata: imageMetadata
      };
    } catch (error) {
      // Cleanup on error
      await this.cleanupFiles([originalPath, processedPath, thumbnailPath]);
      throw new ImageProcessingError(
        `Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'PROCESSING_FAILED'
      );
    }
  }

  async cleanupFiles(filePaths: string[]): Promise<void> {
    for (const filePath of filePaths) {
      try {
        await fs.unlink(filePath);
      } catch (error) {
        // Ignore cleanup errors
        console.warn(`Failed to cleanup file ${filePath}:`, error);
      }
    }
  }

  async getImageInfo(filePath: string): Promise<ImageMetadata> {
    try {
      const metadata = await sharp(filePath).metadata();
      const stats = await fs.stat(filePath);
      
      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        size: stats.size,
        filename: path.basename(filePath)
      };
    } catch (error) {
      throw new ImageProcessingError(
        `Failed to get image info: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'INFO_RETRIEVAL_FAILED'
      );
    }
  }

  async resizeImage(inputPath: string, outputPath: string, width: number, height: number): Promise<void> {
    try {
      await sharp(inputPath)
        .resize(width, height, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outputPath);
    } catch (error) {
      throw new ImageProcessingError(
        `Failed to resize image: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'RESIZE_FAILED'
      );
    }
  }
}

export const imageProcessor = new ImageProcessor(); 
