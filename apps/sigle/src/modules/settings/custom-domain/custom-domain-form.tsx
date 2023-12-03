import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, Button, Text } from '@radix-ui/themes';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'react-toastify';
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
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-1">
        <TextField.Input
          type="text"
          placeholder="blog.yourdomain.com"
          {...register('domain')}
        />
        {errors.domain && (
          <Text as="div" size="2" color="red">
            {errors.domain.message}
          </Text>
        )}
      </div>

      <div className="space-x-2">
        <Button
          type="button"
          variant="outline"
          color="gray"
          disabled={isLoadingUpdateDomain}
          onClick={() => setIsEditing(false)}
        >
          Cancel
        </Button>
        <Button
          color="gray"
          highContrast
          type="submit"
          disabled={isLoadingUpdateDomain}
        >
          {isLoadingUpdateDomain ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
};
