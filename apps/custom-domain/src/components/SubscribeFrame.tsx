'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { SiteSettings } from '@/types';
import { getApiUrl } from '@/utils/vercel';

interface HeroSubscribeProps {
  settings: SiteSettings;
}

const subscribeSchema = z.object({
  email: z.string().email(),
});

type SubscribeFormData = z.infer<typeof subscribeSchema>;

export const SubscribeFrame = ({ settings }: HeroSubscribeProps) => {
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SubscribeFormData>({
    resolver: zodResolver(subscribeSchema),
  });

  const onSubmit = handleSubmit((formValues) => {
    fetch(`${getApiUrl()}/api/subscribers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stacksAddress: settings.address,
        email: formValues.email,
      }),
    })
      .then((res) => {
        if (res.ok) {
          setStatus('success');
          setValue('email', '');
        } else {
          setStatus('error');
        }
      })
      .catch(() => {
        setStatus('error');
      });
  });

  return (
    <div className="flex flex-col items-center">
      {status === 'idle' && (
        <form
          className="flex w-[28rem] max-w-full flex-row items-center justify-center"
          onSubmit={onSubmit}
        >
          <input
            className="h-10 w-full rounded-l-lg border border-gray-300 bg-transparent px-4 text-sm focus:border-gray-400 focus:ring-0"
            aria-label="Enter your email to subscribe"
            placeholder="Enter your email"
            required
            type="email"
            {...register('email')}
          />
          <button
            className="h-10 rounded-r-lg bg-gray-950 px-5 text-sm text-white"
            type="submit"
          >
            Subscribe
          </button>
        </form>
      )}
      {errors.email && <p className="mt-2 text-sm">{errors.email.message}</p>}
      {status === 'error' && (
        <p className="mt-2 text-sm">Something went wrong. Please try again.</p>
      )}
      {status === 'success' && (
        <p className="font-bold">
          You have subscribed to {settings.username} newsletter.
        </p>
      )}
    </div>
  );
};
