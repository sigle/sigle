import { authOptions } from '@/pages/api/auth/[...nextauth].api';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getServerSession } from 'next-auth';
import { optimizeImage } from 'next/dist/server/image-optimizer';
import { NextResponse } from 'next/server';
import sharp from 'sharp';

const client = new S3Client({
  endpoint: 'https://s3.filebase.com',
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.FILEBASE_KEY!,
    secretAccessKey: process.env.FILEBASE_SECRET!,
  },
});

const allowedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function toBuffer(arrayBuffer: ArrayBuffer) {
  const buffer = Buffer.alloc(arrayBuffer.byteLength);
  const view = new Uint8Array(arrayBuffer);
  for (let i = 0; i < buffer.length; ++i) {
    buffer[i] = view[i];
  }
  return buffer;
}

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

  const fileArrayBuffer = await file.arrayBuffer();
  // let sharpImage = sharp(fileArrayBuffer);
  // const meta = await sharpImage.metadata();

  // console.log(meta);
  // const optimisedImage = await sharpImage
  //   .webp({ quality: 20, lossless: true, alphaQuality: 80 })
  //   .toBuffer();

  const optimisedImage = await optimizeImage({
    buffer: toBuffer(fileArrayBuffer),
    contentType: file.type,
    quality: 75,
    width: 1200,
  });

  const command = new PutObjectCommand({
    Bucket: process.env.FILEBASE_BUCKET!,
    // TODO generate unique key
    Key: 'hello-s3.txt',
    Body: optimisedImage,
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
