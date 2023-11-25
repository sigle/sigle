import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { Button, FormHelperError, FormInput, FormRow } from '@/ui';
import { validDomainRegex } from '@/utils/regex';
import { useDomainsControllerUpdate } from '@/__generated__/sigle-api';

const customDomainSchema = z.object({
  domain: z.string().regex(validDomainRegex, 'Please enter a valid domain'),
});

type CustomDomainFormData = z.infer<typeof customDomainSchema>;

export const CustomDomainForm = () => {
  const { mutate: updateDomain, isLoading: isLoadingUpdateDomain } =
    useDomainsControllerUpdate({});

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomDomainFormData>({
    resolver: zodResolver(customDomainSchema),
  });

  const onSubmit = handleSubmit(async (formValues) => {
    console.log(formValues);
    updateDomain(
      {
        body: {
          domain: formValues.domain,
        },
      },
      {
        // TODO onSuccess that refetches the current domain to hide the form
        onError: (error) => {
          toast.error(error?.message);
        },
      },
    );
  });

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

      <Button type="submit" disabled={isLoadingUpdateDomain}>
        {isLoadingUpdateDomain ? 'Saving...' : 'Save'}
      </Button>
    </form>
  );
};