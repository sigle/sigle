import { sigleConfig } from '@/config';
import { redirect } from 'next/navigation';

export default function Page() {
  return redirect(sigleConfig.gammaUrl);
}
