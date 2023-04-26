import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const formData = await request.formData();
  console.log('form data', formData);
  return NextResponse.json({});
}
