import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { authOptions } from '@/pages/api/auth/[...nextauth].api';

const client = new S3Client({
  endpoint: 'https://s3.filebase.com',
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.FILEBASE_KEY!,
    secretAccessKey: process.env.FILEBASE_SECRET!,
  },
});

const WEBP = 'image/webp';
const PNG = 'image/png';
const JPEG = 'image/jpeg';
const GIF = 'image/gif';

const allowedFormats = [
  WEBP,
  PNG,
  JPEG,
  // TODO GIF optimization support
  // GIF
];

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // TODO check file size
  // TODO optimize image before upload

  const formData = await request.formData();

  console.log('form data', formData);

  const file = formData.get('file');
  if (!file || typeof file === 'string') {
    return NextResponse.json({});
  }

  if (!allowedFormats.includes(file.type)) {
    return NextResponse.json({
      error: true,
      message: 'Invalid file format.',
    });
  }

  const quality = 75;
  const width = 1000;
  const fileArrayBuffer = await file.arrayBuffer();

  const transformer = sharp(fileArrayBuffer);
  transformer.resize(width, undefined, {
    withoutEnlargement: true,
  });
  if (file.type === WEBP) {
    transformer.webp({ quality });
  } else if (file.type === PNG) {
    transformer.png({ quality });
  } else if (file.type === JPEG) {
    transformer.jpeg({ quality });
  }
  const optimizedBuffer = await transformer.toBuffer();

  const command = new PutObjectCommand({
    Bucket: process.env.FILEBASE_BUCKET!,
    // TODO generate unique key
    Key: 'hello-s3.txt',
    Body: optimizedBuffer,
  });

  // Inject CID returned from Filebase into response
  command.middlewareStack.add(
    (next) => async (args) => {
      // Check if request is incoming as middleware works both ways
      const response: any = await next(args);
      if (!response.response.statusCode) return response;

      // Get cid from headers
      const cid = response.response.headers['x-amz-meta-cid'];
      response.output.cid = cid;
      return response;
    },
    {
      step: 'build',
      name: 'addCidToOutput',
    }
  );

  try {
    const response = await client.send(command);
    // @ts-expect-error cid is injected by middleware
    const cid = response.cid;
    return NextResponse.json({
      cid,
      url: `ipfs://${cid}`,
    });
  } catch (err) {
    return NextResponse.json({
      error: true,
      message: 'Failed to upload file.',
    });
  }
}
