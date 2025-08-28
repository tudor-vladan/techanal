import { imageProcessor, ImageProcessingError } from './image-processing';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';

// Type definition for Express Multer file
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface ProcessedImageInfo {
  buffer: Buffer;
  info: {
    width: number;
    height: number;
    format: string;
    size: number;
    chartType?: string;
    timeframe?: string;
  };
}

export interface ChartPatternDetection {
  chartType: string;
  timeframe: string;
  patterns: string[];
  confidence: number;
}

/**
 * Validate uploaded image file
 */
export async function validateImage(file: MulterFile): Promise<void> {
  // Check file size
  if (file.size > 10 * 1024 * 1024) { // 10MB
    throw new ImageProcessingError(
      `File size ${file.size} bytes exceeds maximum allowed size of 10MB`,
      'FILE_TOO_LARGE'
    );
  }

  // Check file format
  const allowedFormats = ['jpeg', 'jpg', 'png', 'webp'];
  const fileExtension = path.extname(file.originalname).toLowerCase().slice(1);
  if (!allowedFormats.includes(fileExtension)) {
    throw new ImageProcessingError(
      `File format ${fileExtension} is not allowed. Allowed formats: ${allowedFormats.join(', ')}`,
      'INVALID_FORMAT'
    );
  }

  // Validate image dimensions and format using Sharp
  try {
    const sharp = await import('sharp');
    const metadata = await sharp.default(file.buffer).metadata();
    
    if (!metadata.width || !metadata.height) {
      throw new ImageProcessingError('Unable to determine image dimensions', 'INVALID_IMAGE');
    }

    if (metadata.width < 1 || metadata.height < 1) {
      throw new ImageProcessingError(
        `Image dimensions ${metadata.width}x${metadata.height} are below minimum 1x1`,
        'DIMENSIONS_TOO_SMALL'
      );
    }

    if (metadata.width > 4000 || metadata.height > 4000) {
      throw new ImageProcessingError(
        `Image dimensions ${metadata.width}x${metadata.height} exceed maximum 4000x4000`,
        'DIMENSIONS_TOO_LARGE'
      );
    }

    if (!metadata.format || !allowedFormats.includes(metadata.format)) {
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
      `Failed to validate image: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'VALIDATION_FAILED'
    );
  }
}

/**
 * Compress and optimize image
 */
export async function compressImage(imageBuffer: Buffer): Promise<ProcessedImageInfo> {
  try {
    const sharp = await import('sharp');
    
    // Get original metadata
    const metadata = await sharp.default(imageBuffer).metadata();
    
    // Compress and optimize image
    const processedBuffer = await sharp.default(imageBuffer)
      .webp({ quality: 85, effort: 6 })
      .resize(1920, 1080, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .toBuffer();

    return {
      buffer: processedBuffer,
      info: {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'webp',
        size: processedBuffer.length,
        chartType: 'candlestick', // Default assumption
        timeframe: '1h' // Default assumption
      }
    };
  } catch (error) {
    throw new ImageProcessingError(
      `Failed to compress image: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'COMPRESSION_FAILED'
    );
  }
}

/**
 * Save image to disk
 */
export async function saveImage(imageBuffer: Buffer, originalFilename: string, uploadDir: string): Promise<{ filename: string; filepath: string }> {
  try {
    // Ensure upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });
    
    // Generate unique filename
    const fileExtension = path.extname(originalFilename);
    const filename = `${uuidv4()}${fileExtension}`;
    const filepath = path.join(uploadDir, filename);
    
    // Save image
    await fs.writeFile(filepath, imageBuffer);
    
    return { filename, filepath };
  } catch (error) {
    throw new ImageProcessingError(
      `Failed to save image: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'SAVE_FAILED'
    );
  }
}

/**
 * Detect chart patterns in image
 */
export async function detectChartPatterns(imageBuffer: Buffer): Promise<ChartPatternDetection> {
  try {
    // This is a simplified pattern detection
    // In a real implementation, you would use computer vision libraries
    // like OpenCV or TensorFlow.js for pattern recognition
    
    // For now, return mock detection
    const patterns = ['candlestick', 'support_resistance', 'trend_lines'];
    const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d'];
    
    return {
      chartType: 'candlestick',
      timeframe: timeframes[Math.floor(Math.random() * timeframes.length)],
      patterns: patterns.slice(0, Math.floor(Math.random() * patterns.length) + 1),
      confidence: 0.7 + Math.random() * 0.3
    };
  } catch (error) {
    // Return default detection on error
    return {
      chartType: 'candlestick',
      timeframe: '1h',
      patterns: ['candlestick'],
      confidence: 0.5
    };
  }
}
