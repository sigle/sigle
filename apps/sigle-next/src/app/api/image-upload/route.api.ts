import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

const client = new S3Client({
  endpoint: 'https://s3.filebase.com',
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.FILEBASE_KEY!,
    secretAccessKey: process.env.FILEBASE_SECRET!,
  },
});

export async function POST(request: Request) {
  // TODO protect auth
  // TODO check file extension
  // TODO check file size
  // TODO optimize image before upload

  const formData = await request.formData();

  console.log('form data', formData);

  const file = formData.get('file');
  if (!file || typeof file === 'string') {
    return NextResponse.json({});
  }
  console.log('file', file);
  const fileArrayBuffer = await file.arrayBuffer();

  const command = new PutObjectCommand({
    Bucket: process.env.FILEBASE_BUCKET!,
    // TODO generate unique key
    Key: 'hello-s3.txt',
    Body: fileArrayBuffer as Buffer,
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
