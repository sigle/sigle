import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { Button, FormHelperError, FormInput, FormRow } from '@/ui';
import { validDomainRegex } from '@/utils/regex';
import {
  DomainEntity,
  useDomainsControllerUpdate,
} from '@/__generated__/sigle-api';

interface CustomDomainFormProps {
  domain?: DomainEntity;
  setIsEditing: (isEditing: boolean) => void;
  refetchDomain: () => void;
}

const customDomainSchema = z.object({
  domain: z.string().regex(validDomainRegex, 'Please enter a valid domain'),
});

type CustomDomainFormData = z.infer<typeof customDomainSchema>;

export const CustomDomainForm = ({
  domain,
  setIsEditing,
  refetchDomain,
}: CustomDomainFormProps) => {
  const { mutate: updateDomain, isLoading: isLoadingUpdateDomain } =
    useDomainsControllerUpdate({});

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomDomainFormData>({
    resolver: zodResolver(customDomainSchema),
    defaultValues: {
      domain: domain?.domain,
    },
  });

  const onSubmit = handleSubmit(async (formValues) => {
    updateDomain(
      {
        body: {
          domain: formValues.domain,
        },
      },
      {
        onSuccess: () => {
          refetchDomain();
          setIsEditing(false);
          toast.success('Domain updated!');
        },
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

      <div className="space-x-2">
        <Button
          type="button"
          variant="outline"
          disabled={isLoadingUpdateDomain}
          onClick={() => setIsEditing(false)}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoadingUpdateDomain}>
          {isLoadingUpdateDomain ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
};
