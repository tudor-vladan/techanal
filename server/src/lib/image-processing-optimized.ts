import sharp from 'sharp';
import type { Request } from 'express';
// Define minimal Multer file interface locally to avoid global namespace issues
export interface MulterFileLike {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}
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
  processingTime: number;
  compressionRatio: number;
}

export class ImageProcessingError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'ImageProcessingError';
  }
}

export interface ProcessingOptions {
  quality: number;
  maxWidth: number;
  maxHeight: number;
  format: 'webp' | 'jpeg' | 'png';
  parallel: boolean;
  adaptiveQuality: boolean;
}

export class ImageProcessorOptimized {
  private readonly uploadDir = './uploads';
  private readonly processedDir = './processed';
  private readonly thumbnailDir = './thumbnails';
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB
  private readonly maxDimensions = { width: 4000, height: 4000 };
  private readonly minDimensions = { width: 100, height: 100 };
  private readonly allowedFormats = ['jpeg', 'jpg', 'png', 'webp'];
  private defaultOptions: ProcessingOptions = {
    quality: 85,
    maxWidth: 1920,
    maxHeight: 1080,
    format: 'webp',
    parallel: true,
    adaptiveQuality: true
  };

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

  /**
   * Validate image with optimized checks
   */
  async validateImage(file: MulterFileLike): Promise<void> {
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

    // Validate image dimensions and format using Sharp with optimized settings
    try {
      const metadata = await sharp(file.buffer, { 
        failOnError: false,
        limitInputPixels: false 
      }).metadata();
      
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

  /**
   * Process image with optimized pipeline and parallel processing
   */
  async processImage(file: MulterFileLike, options: Partial<ProcessingOptions> = {}): Promise<ProcessedImage> {
    const startTime = Date.now();
    const processingOptions = { ...this.defaultOptions, ...options };
    
    const filename = `${uuidv4()}-${Date.now()}`;
    const originalPath = path.join(this.uploadDir, `${filename}.${path.extname(file.originalname)}`);
    const processedPath = path.join(this.processedDir, `${filename}.${processingOptions.format}`);
    const thumbnailPath = path.join(this.thumbnailDir, `${filename}-thumb.${processingOptions.format}`);

    try {
      // Save original file
      await fs.writeFile(originalPath, file.buffer);

      // Adaptive quality based on image size
      const adaptiveQuality = this.calculateAdaptiveQuality(file.size, processingOptions.adaptiveQuality);
      
      if (processingOptions.parallel) {
        // Parallel processing for better performance
        const [processedBuffer, thumbnailBuffer] = await Promise.all([
          this.processMainImage(file.buffer, processingOptions, adaptiveQuality),
          this.processThumbnail(file.buffer, processingOptions, adaptiveQuality)
        ]);

        // Parallel file writing
        await Promise.all([
          fs.writeFile(processedPath, processedBuffer),
          fs.writeFile(thumbnailPath, thumbnailBuffer)
        ]);
      } else {
        // Sequential processing (fallback)
        const processedBuffer = await this.processMainImage(file.buffer, processingOptions, adaptiveQuality);
        const thumbnailBuffer = await this.processThumbnail(file.buffer, processingOptions, adaptiveQuality);

        await fs.writeFile(processedPath, processedBuffer);
        await fs.writeFile(thumbnailPath, thumbnailBuffer);
      }

      // Get metadata
      const metadata = await sharp(file.buffer).metadata();
      
      const imageMetadata: ImageMetadata = {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        size: file.size,
        filename: file.originalname
      };

      const processingTime = Date.now() - startTime;
      const compressionRatio = ((file.size - (await fs.stat(processedPath)).size) / file.size * 100);

      return {
        originalPath,
        processedPath,
        thumbnailPath,
        metadata: imageMetadata,
        processingTime,
        compressionRatio
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

  /**
   * Process main image with optimized settings
   */
  private async processMainImage(
    buffer: Buffer, 
    options: ProcessingOptions, 
    quality: number
  ): Promise<Buffer> {
    const sharpInstance = sharp(buffer, {
      failOnError: false,
      limitInputPixels: false
    });

    // Optimize based on format
    switch (options.format) {
      case 'webp':
        return sharpInstance
          .webp({ 
            quality, 
            effort: 6, // Maximum compression effort
            nearLossless: quality > 90,
            smartSubsample: true
          })
          .resize(options.maxWidth, options.maxHeight, { 
            fit: 'inside',
            withoutEnlargement: true,
            kernel: sharp.kernel.lanczos3 // High quality resizing
          })
          .toBuffer();

      case 'jpeg':
        return sharpInstance
          .jpeg({ 
            quality, 
            progressive: true,
            mozjpeg: true, // Mozilla JPEG optimization
            chromaSubsampling: '4:4:4' // Better color quality
          })
          .resize(options.maxWidth, options.maxHeight, { 
            fit: 'inside',
            withoutEnlargement: true,
            kernel: sharp.kernel.lanczos3
          })
          .toBuffer();

      case 'png':
        return sharpInstance
          .png({ 
            quality, 
            compressionLevel: 9, // Maximum compression
            progressive: true,
            palette: true // Optimize colors
          })
          .resize(options.maxWidth, options.maxHeight, { 
            fit: 'inside',
            withoutEnlargement: true,
            kernel: sharp.kernel.lanczos3
          })
          .toBuffer();

      default:
        return sharpInstance
          .webp({ quality, effort: 6 })
          .resize(options.maxWidth, options.maxHeight, { 
            fit: 'inside',
            withoutEnlargement: true 
          })
          .toBuffer();
    }
  }

  /**
   * Process thumbnail with optimized settings
   */
  private async processThumbnail(
    buffer: Buffer, 
    options: ProcessingOptions, 
    quality: number
  ): Promise<Buffer> {
    const thumbnailQuality = Math.max(60, quality - 20); // Slightly lower quality for thumbnails
    
    return sharp(buffer, {
      failOnError: false,
      limitInputPixels: false
    })
    .resize(400, 300, { 
      fit: 'cover',
      position: 'center',
      kernel: sharp.kernel.lanczos3
    })
    .webp({ 
      quality: thumbnailQuality, 
      effort: 4, // Lower effort for thumbnails
      smartSubsample: true
    })
    .toBuffer();
  }

  /**
   * Calculate adaptive quality based on image size
   */
  private calculateAdaptiveQuality(fileSize: number, adaptiveQuality: boolean): number {
    if (!adaptiveQuality) return this.defaultOptions.quality;

    // Adaptive quality based on file size
    if (fileSize < 1024 * 1024) { // < 1MB
      return 90; // High quality for small images
    } else if (fileSize < 5 * 1024 * 1024) { // 1-5MB
      return 85; // Medium-high quality
    } else if (fileSize < 10 * 1024 * 1024) { // 5-10MB
      return 80; // Medium quality
    } else {
      return 75; // Lower quality for very large images
    }
  }

  /**
   * Batch process multiple images with parallel processing
   */
  async processImages(files: MulterFileLike[], options: Partial<ProcessingOptions> = {}): Promise<ProcessedImage[]> {
    const processingOptions = { ...this.defaultOptions, ...options };
    
    if (processingOptions.parallel) {
      // Parallel processing for multiple images
      const processingPromises = files.map(file => this.processImage(file, processingOptions));
      return Promise.all(processingPromises);
    } else {
      // Sequential processing
      const results: ProcessedImage[] = [];
      for (const file of files) {
        const result = await this.processImage(file, processingOptions);
        results.push(result);
      }
      return results;
    }
  }

  /**
   * Optimize image for web delivery
   */
  async optimizeForWeb(inputPath: string, outputPath: string, options: Partial<ProcessingOptions> = {}): Promise<void> {
    const processingOptions = { ...this.defaultOptions, ...options };
    const quality = this.calculateAdaptiveQuality((await fs.stat(inputPath)).size, processingOptions.adaptiveQuality);

    try {
      await sharp(inputPath, {
        failOnError: false,
        limitInputPixels: false
      })
      .webp({ 
        quality, 
        effort: 6,
        nearLossless: quality > 90,
        smartSubsample: true
      })
      .resize(processingOptions.maxWidth, processingOptions.maxHeight, { 
        fit: 'inside',
        withoutEnlargement: true,
        kernel: sharp.kernel.lanczos3
      })
      .toFile(outputPath);
    } catch (error) {
      throw new ImageProcessingError(
        `Failed to optimize image for web: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'WEB_OPTIMIZATION_FAILED'
      );
    }
  }

  /**
   * Create responsive image variants
   */
  async createResponsiveVariants(
    inputPath: string, 
    outputDir: string, 
    sizes: Array<{ width: number; height: number; suffix: string }>
  ): Promise<string[]> {
    const outputPaths: string[] = [];
    
    try {
      const variants = sizes.map(async (size) => {
        const outputPath = path.join(outputDir, `responsive-${size.suffix}.webp`);
        
        await sharp(inputPath, {
          failOnError: false,
          limitInputPixels: false
        })
        .webp({ 
          quality: 85, 
          effort: 6,
          smartSubsample: true
        })
        .resize(size.width, size.height, { 
          fit: 'inside',
          withoutEnlargement: true,
          kernel: sharp.kernel.lanczos3
        })
        .toFile(outputPath);
        
        outputPaths.push(outputPath);
      });

      // Process all variants in parallel
      await Promise.all(variants);
      
      return outputPaths;
    } catch (error) {
      throw new ImageProcessingError(
        `Failed to create responsive variants: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'RESPONSIVE_VARIANTS_FAILED'
      );
    }
  }

  /**
   * Cleanup files with error handling
   */
  async cleanupFiles(filePaths: string[]): Promise<void> {
    const cleanupPromises = filePaths.map(async (filePath) => {
      try {
        await fs.unlink(filePath);
      } catch (error) {
        // Ignore cleanup errors
        console.warn(`Failed to cleanup file ${filePath}:`, error);
      }
    });

    await Promise.all(cleanupPromises);
  }

  /**
   * Get image info with performance metrics
   */
  async getImageInfo(filePath: string): Promise<ImageMetadata & { processingTime?: number }> {
    try {
      const startTime = Date.now();
      
      const metadata = await sharp(filePath).metadata();
      const stats = await fs.stat(filePath);
      
      const processingTime = Date.now() - startTime;
      
      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        size: stats.size,
        filename: path.basename(filePath),
        processingTime
      };
    } catch (error) {
      throw new ImageProcessingError(
        `Failed to get image info: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'INFO_RETRIEVAL_FAILED'
      );
    }
  }

  /**
   * Resize image with optimized settings
   */
  async resizeImage(
    inputPath: string, 
    outputPath: string, 
    width: number, 
    height: number, 
    options: Partial<ProcessingOptions> = {}
  ): Promise<void> {
    const processingOptions = { ...this.defaultOptions, ...options };
    const quality = this.calculateAdaptiveQuality((await fs.stat(inputPath)).size, processingOptions.adaptiveQuality);

    try {
      await sharp(inputPath, {
        failOnError: false,
        limitInputPixels: false
      })
      .resize(width, height, { 
        fit: 'inside', 
        withoutEnlargement: true,
        kernel: sharp.kernel.lanczos3
      })
      .webp({ quality })
      .toFile(outputPath);
    } catch (error) {
      throw new ImageProcessingError(
        `Failed to resize image: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'RESIZE_FAILED'
      );
    }
  }

  /**
   * Get processing statistics
   */
  getProcessingStats(): { 
    parallelProcessing: boolean; 
    adaptiveQuality: boolean; 
    defaultQuality: number;
    maxDimensions: { width: number; height: number };
    supportedFormats: string[];
  } {
    return {
      parallelProcessing: this.defaultOptions.parallel,
      adaptiveQuality: this.defaultOptions.adaptiveQuality,
      defaultQuality: this.defaultOptions.quality,
      maxDimensions: this.maxDimensions,
      supportedFormats: this.allowedFormats
    };
  }

  /**
   * Update processing options
   */
  updateProcessingOptions(options: Partial<ProcessingOptions>): void {
    this.defaultOptions = { ...this.defaultOptions, ...options };
  }
}

// Export singleton instance
export const imageProcessorOptimized = new ImageProcessorOptimized();
