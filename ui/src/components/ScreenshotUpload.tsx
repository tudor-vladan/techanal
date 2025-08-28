import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScreenshotUploadProps } from '@/types/analysis';
import { Upload, X, Image as ImageIcon, FileImage } from 'lucide-react';

export function ScreenshotUpload({ onImageSelected, onError, isLoading }: ScreenshotUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      onError('Please select an image file (PNG, JPG, JPEG)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      onError('File size must be less than 10MB');
      return;
    }

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedFile(file);
    onImageSelected(file);
    onError(''); // Clear any previous errors
  }, [onImageSelected, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1,
    disabled: isLoading
  });

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    onError('');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onDrop([file]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Screenshot Trading</h3>
        <p className="text-sm text-muted-foreground">
          Încarcă o imagine de la platforma ta de trading pentru analiză
        </p>
      </div>

      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive || dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
            }
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onDragEnter={() => setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
        >
          <input {...getInputProps()} />
          
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              {isDragActive ? (
                <Upload className="w-8 h-8 text-primary" />
              ) : (
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            
            <div>
              <p className="text-lg font-medium">
                {isDragActive ? 'Drop image here' : 'Drag & drop image here'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse files
              </p>
            </div>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Supported formats: PNG, JPG, JPEG, WebP</p>
              <p>Maximum size: 10MB</p>
            </div>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <FileImage className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                disabled={isLoading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {previewUrl && (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Screenshot preview"
                  className="w-full h-48 object-contain rounded-lg border bg-muted"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors rounded-lg" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Alternative file input for mobile */}
      <div className="text-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => document.getElementById('file-input')?.click()}
          disabled={isLoading}
          className="hidden sm:inline-flex"
        >
          <Upload className="w-4 h-4 mr-2" />
          Browse Files
        </Button>
        <input
          id="file-input"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* File requirements info */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-medium text-sm mb-2">Cerințe pentru imagine:</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Format: PNG, JPG, JPEG, WebP</li>
          <li>• Dimensiune maximă: 10MB</li>
          <li>• Dimensiuni minime: 100x100 pixeli</li>
          <li>• Dimensiuni maxime: 4000x4000 pixeli</li>
          <li>• Imaginea trebuie să conțină un chart de trading clar</li>
        </ul>
      </div>
    </div>
  );
}
