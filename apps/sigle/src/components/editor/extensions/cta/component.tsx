import React, { useEffect, useState } from 'react';
import { NodeViewProps } from '@tiptap/core';
import { NodeViewWrapper } from '@tiptap/react';
import {
  Button,
  Dialog,
  Flex,
  RadioGroup,
  Text,
  TextField,
} from '@radix-ui/themes';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { cn } from '@/lib/cn';

const ctaSchema = z.object({
  label: z.string().min(1).max(50),
  url: z.string().url(),
  size: z.enum(['sm', 'md', 'lg']),
});

type CtaFormData = z.infer<typeof ctaSchema>;

export const CtaComponent = (props: NodeViewProps) => {
  const [showCtatDialog, setShowCtaDialog] = useState(false);
  const handleCancelCtaDialog = () => setShowCtaDialog(false);

  const label = props.node.attrs.label;
  const url = props.node.attrs.url;
  const size = props.node.attrs.size;

  const hasAttrs = label && size && url;

  useEffect(() => {
    if (!hasAttrs) {
      setShowCtaDialog(true);
    }
  }, []);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<CtaFormData>({
    resolver: zodResolver(ctaSchema),
    defaultValues: {
      label: props.node.attrs.label || '',
      url: props.node.attrs.url || '',
      size: props.node.attrs.size || 'md',
    },
  });

  const onSubmit = handleSubmit(async (formValues) => {
    props.editor.commands.updateAttributes('cta', {
      ...props.node.attrs,
      label: formValues.label,
      url: formValues.url,
      size: formValues.size,
    });

    if (!hasAttrs) {
      props.editor.commands.createParagraphNear();
    }

    handleCancelCtaDialog();
  });

  return (
    <NodeViewWrapper>
      <div
        data-cta
        data-drag-handle
        className={cn('flex justify-center', {
          'outline outline-0 outline-offset-2 outline-orange-9 hover:outline-2':
            props.editor.isEditable,
          'outline-2': props.selected,
        })}
      >
        {props.editor.isEditable && (
          <Dialog.Root
            open={showCtatDialog}
            onOpenChange={handleCancelCtaDialog}
          >
            <Dialog.Content size="3" className="max-w-[450px]">
              <Dialog.Title asChild>Style your button</Dialog.Title>
              <form className="space-y-4" onSubmit={onSubmit}>
                <div className="space-y-1">
                  <TextField.Input
                    maxLength={45}
                    placeholder="Enter text..."
                    {...register('label')}
                  />
                  {errors.label && (
                    <Text as="p" size="2" color="red">
                      {errors.label.message}
                    </Text>
                  )}
                  <Text as="p" size="1" color="gray">
                    Max: 45 characters.
                  </Text>
                </div>
                <div className="space-y-1">
                  <TextField.Input
                    maxLength={100}
                    placeholder="Enter URL..."
                    {...register('url')}
                  />
                  {errors.url && (
                    <Text as="p" size="2" color="red">
                      {errors.url.message}
                    </Text>
                  )}
                </div>
                <Flex direction="column" gap="3">
                  <div className="grid grid-cols-3">
                    <div className="flex items-center justify-center">
                      <Button className="pointer-events-none" size="3">
                        Large
                      </Button>
                    </div>
                    <div className="flex items-center justify-center">
                      <Button className="pointer-events-none" size="2">
                        Medium
                      </Button>
                    </div>
                    <div className="flex items-center justify-center">
                      <Button className="pointer-events-none" size="1">
                        Small
                      </Button>
                    </div>
                  </div>
                  <RadioGroup.Root
                    name="size"
                    onValueChange={(e) =>
                      setValue('size', e as 'sm' | 'md' | 'lg')
                    }
                    defaultValue={getValues('size') || 'md'}
                    aria-label="Call to action button size"
                  >
                    <div className="grid grid-cols-3">
                      <div className="flex justify-center">
                        <RadioGroup.Item value="lg" id="lg" />
                      </div>
                      <div className="flex justify-center">
                        <RadioGroup.Item value="md" id="md" />
                      </div>
                      <div className="flex justify-center">
                        <RadioGroup.Item value="sm" id="sm" />
                      </div>
                    </div>
                  </RadioGroup.Root>
                </Flex>
                <Text as="p" size="2" color="gray">
                  Tips: You can customize your primary color on the settings
                  page.
                </Text>

                <Flex gap="3" justify="end">
                  <Button
                    onClick={handleCancelCtaDialog}
                    variant="soft"
                    color="gray"
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {hasAttrs ? 'Update Button' : 'Create Button'}
                  </Button>
                </Flex>
              </form>
            </Dialog.Content>
          </Dialog.Root>
        )}

        {/* p is used to add some margin to the button, it's important to keep it */}
        <p>
          <Button
            className="not-prose"
            size={
              props.node.attrs.size === 'sm'
                ? '1'
                : props.node.attrs.size === 'md'
                  ? '2'
                  : '3'
            }
            asChild
          >
            <a
              className={cn({
                hidden: !hasAttrs,
                'inline-flex': hasAttrs,
              })}
              href={props.node.attrs.url}
              onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
                if (props.editor.isEditable) {
                  e.preventDefault();
                  setShowCtaDialog(true);
                }
              }}
              target="_blank"
              rel="noreferrer"
            >
              {props.node.attrs.label}
            </a>
          </Button>
        </p>
      </div>
    </NodeViewWrapper>
  );
};
