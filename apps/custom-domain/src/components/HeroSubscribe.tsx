'use client';
import { SiteSettings } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface HeroSubscribeProps {
  settings: SiteSettings;
  newsletter: { id: string };
}

const subscribeSchema = z.object({
  email: z.string().email(),
});

type SubscribeFormData = z.infer<typeof subscribeSchema>;

export const HeroSubscribe = ({ settings, newsletter }: HeroSubscribeProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SubscribeFormData>({
    resolver: zodResolver(subscribeSchema),
  });

  const onSubmit = handleSubmit((formValues) => {
    console.log(formValues);
    fetch(`${process.env.API_URL}/api/subscribers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stacksAddress: settings.address,
        email: formValues.email,
      }),
    }).then((res) => {
      if (res.ok) {
        setValue('email', '');
        // TODO: Show success message
      }
    });
  });

  return (
    <form
      className="container mt-5 flex max-w-md flex-row items-center justify-center"
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
      {/* TODO show error message */}
    </form>
  );
};
