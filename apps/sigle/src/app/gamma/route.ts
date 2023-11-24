import { sigleConfig } from '@/config';
import { redirect } from 'next/navigation';

export async function GET() {
  redirect(sigleConfig.gammaUrl);
}
