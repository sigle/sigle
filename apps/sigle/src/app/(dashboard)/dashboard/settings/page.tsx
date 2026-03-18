import { SettingsProfileMetadata } from "@/components/Dashboard/Settings/Metadata";

export default function Settings() {
  return (
    <div className="space-y-8 py-10">
      <h2 className="text-2xl font-bold">Settings</h2>

      <SettingsProfileMetadata />
    </div>
  );
}
