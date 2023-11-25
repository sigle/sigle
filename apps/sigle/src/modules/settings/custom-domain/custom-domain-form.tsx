import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button, FormHelperError, FormInput, FormRow } from '@/ui';
import { validDomainRegex } from '@/utils/regex';

const customDomainSchema = z.object({
  domain: z.string().regex(validDomainRegex, 'Please enter a valid domain'),
});

type CustomDomainFormData = z.infer<typeof customDomainSchema>;

export const CustomDomainForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomDomainFormData>({
    resolver: zodResolver(customDomainSchema),
  });

  const onSubmit = handleSubmit(async (formValues) => {
    console.log(formValues);
  });

  // TODO loading state
  const isLoadingUpdateNewsletter = false;

  return (
    <form onSubmit={onSubmit}>
      <FormRow>
        <FormInput
          type="text"
          placeholder="blog.yourdomain.com"
          {...register('domain')}
        />
        {errors.domain && (
          <FormHelperError>{errors.domain.message}</FormHelperError>
        )}
      </FormRow>

      <Button type="submit" disabled={isLoadingUpdateNewsletter}>
        {isLoadingUpdateNewsletter ? 'Saving...' : 'Save'}
      </Button>
    </form>
  );
};
