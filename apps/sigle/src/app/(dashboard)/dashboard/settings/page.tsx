import { SettingsProfileMetadata } from "@/components/Dashboard/Settings/Metadata";
import { Heading } from "@radix-ui/themes";

export default function Settings() {
  return (
    <div className="space-y-8 py-10">
      <Heading>Settings</Heading>

      <SettingsProfileMetadata />
    </div>
  );
}
