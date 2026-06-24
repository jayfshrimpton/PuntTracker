import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { checkFeatureAccess } from '@/utils/subscription';
import { parseSpreadsheet } from '@/lib/bet-import/parse-spreadsheet';
import { parseWithAi } from '@/lib/bet-import/parse-with-ai';
import { MAX_IMPORT_FILE_BYTES, type ImportFileType, type ImportResult } from '@/lib/bet-import/types';

export const dynamic = 'force-dynamic';
// Allow extra time for AI parsing of larger PDFs.
export const maxDuration = 60;

const SPREADSHEET_EXTS = ['csv', 'xlsx', 'xls', 'xlsm'];
const IMAGE_MIME = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

function detectFileType(name: string, mime: string): {
  type: ImportFileType;
  aiMime?: string;
} {
  const ext = (name.split('.').pop() || '').toLowerCase();

  if (ext === 'csv' || mime === 'text/csv') return { type: 'csv' };
  if (ext === 'xlsx' || ext === 'xls' || ext === 'xlsm' || mime.includes('spreadsheet') || mime.includes('excel')) {
    return { type: 'xlsx' };
  }
  if (ext === 'pdf' || mime === 'application/pdf') return { type: 'pdf', aiMime: 'application/pdf' };
  if (IMAGE_MIME.includes(mime) || ['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
    const aiMime = mime && IMAGE_MIME.includes(mime) ? mime : `image/${ext === 'jpg' ? 'jpeg' : ext}`;
    return { type: 'image', aiMime };
  }
  return { type: 'unknown' };
}

export const POST = withAuth(async (req: NextRequest) => {
  try {
    // Gate behind the import/export feature flag (same flag the bets UI uses).
    const hasAccess = await checkFeatureAccess('csv_import_export');
    if (!hasAccess) {
      return NextResponse.json(
        {
          error: 'Feature not available',
          message: 'Bet import is not available on your plan. Upgrade to access imports.',
          code: 'FEATURE_LOCKED',
          upgradeUrl: '/pricing',
        },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { error: 'Validation error', message: 'No file uploaded', code: 'NO_FILE' },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: 'Validation error', message: 'Uploaded file is empty', code: 'EMPTY_FILE' },
        { status: 400 }
      );
    }

    if (file.size > MAX_IMPORT_FILE_BYTES) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: `File is too large. Maximum size is ${Math.round(MAX_IMPORT_FILE_BYTES / (1024 * 1024))}MB.`,
          code: 'FILE_TOO_LARGE',
        },
        { status: 400 }
      );
    }

    const { type, aiMime } = detectFileType(file.name, file.type || '');
    const arrayBuffer = await file.arrayBuffer();

    let result: ImportResult;

    if (type === 'csv' || type === 'xlsx') {
      result = parseSpreadsheet(arrayBuffer, type);
    } else if (type === 'pdf' || type === 'image') {
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      result = await parseWithAi(base64, aiMime || 'application/pdf', type);
    } else {
      return NextResponse.json(
        {
          error: 'Unsupported file type',
          message: 'Please upload a CSV, Excel (.xlsx/.xls), PDF, or image (PNG/JPG) file.',
          code: 'UNSUPPORTED_TYPE',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Bet import parse error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to read the uploaded file',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
});
