import { redirect } from 'next/navigation';
import { sigleConfig } from '@/config';

export async function GET() {
  redirect(sigleConfig.gammaUrl);
}
