/**
 * Upload File DTO
 */

import { z } from 'zod';

export const UploadFileSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  originalFilename: z.string().min(1, 'Original filename is required'),
  mimeType: z.string().min(1, 'MIME type is required'),
  size: z.number().positive('File size must be positive'),
  path: z.string().min(1, 'File path is required'),
  url: z.string().url('URL must be valid'),
  uploadedBy: z.string().min(1, 'Uploader ID is required'),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.any()).optional(),
});

export type UploadFileDTO = z.infer<typeof UploadFileSchema>;
