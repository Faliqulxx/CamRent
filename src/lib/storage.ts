import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export const DEFAULT_TENT_PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300" fill="%23E6F4EC"><rect width="400" height="300" fill="%23E6F4EC"/><path d="M200 70 L310 220 L90 220 Z" fill="%230F6B3F" opacity="0.85"/><path d="M200 70 L200 220 L90 220 Z" fill="%230B4F2F" opacity="0.95"/><path d="M170 170 L200 220 L140 220 Z" fill="%23E6F4EC"/><text x="200" y="260" font-family="sans-serif" font-size="16" font-weight="600" fill="%230F6B3F" text-anchor="middle">CampRent Equipment</text></svg>';

export interface UploadOptions {
  bucket: 'product-images' | 'condition-photos';
  path: string;
  file: Buffer | Blob | File;
  contentType: string;
}

export class StorageService {
  /**
   * Upload file to Supabase storage or return Data URL fallback in dev mode
   */
  static async upload(
    bucket: 'product-images' | 'condition-photos',
    path: string,
    fileData: Buffer | Uint8Array,
    contentType: string = 'image/jpeg'
  ): Promise<string> {
    if (supabase) {
      const { error } = await supabase.storage.from(bucket).upload(path, fileData, {
        contentType,
        upsert: true,
      });

      if (error) {
        console.error('Supabase storage upload error:', error);
        throw error;
      }

      if (bucket === 'product-images') {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        return data.publicUrl;
      } else {
        // Private signed URL for condition-photos
        const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24);
        return data?.signedUrl || '';
      }
    }

    // Local/dev fallback: generate base64 data URI so uploads work immediately without Supabase setup
    const base64 = Buffer.from(fileData).toString('base64');
    return `data:${contentType};base64,${base64}`;
  }

  static async getUrl(bucket: 'product-images' | 'condition-photos', path: string): Promise<string> {
    if (supabase) {
      if (bucket === 'product-images') {
        return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
      } else {
        const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
        return data?.signedUrl || '';
      }
    }
    return DEFAULT_TENT_PLACEHOLDER;
  }

  static async delete(bucket: 'product-images' | 'condition-photos', paths: string[]): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase.storage.from(bucket).remove(paths);
      return !error;
    }
    return true;
  }
}
