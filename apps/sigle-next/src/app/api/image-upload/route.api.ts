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
    Bucket: 'sigle-staging',
    Key: 'hello-s3.txt',
    Body: fileArrayBuffer as Buffer,
  });

  try {
    const response = await client.send(command);
    console.log(response);
  } catch (err) {
    console.error(err);
  }

  return NextResponse.json({});
}
