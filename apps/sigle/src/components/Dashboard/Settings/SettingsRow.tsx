import { FieldDescription, FieldLabel } from "@/components/ui/field";

interface SettingsRowProps {
  label: React.ReactNode;
  /** The id of the input the label is for, when the row holds one. */
  htmlFor?: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}

/** A settings row, with its label on the left and its control on the right. */
export const SettingsRow = ({
  label,
  htmlFor,
  description,
  children,
}: SettingsRowProps) => (
  <div className="grid gap-3 border-b border-border py-6 md:grid-cols-[180px_1fr] md:gap-8">
    <div className="space-y-1">
      {htmlFor ? (
        <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
      ) : (
        <p className="text-sm font-medium">{label}</p>
      )}
      {description ? <FieldDescription>{description}</FieldDescription> : null}
    </div>
    <div className="min-w-0 space-y-2">{children}</div>
  </div>
);
