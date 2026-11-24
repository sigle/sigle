import { SettingsAccount } from "@/components/Dashboard/Settings/Account";
import { SettingsProfileMetadata } from "@/components/Dashboard/Settings/Metadata";

export default function Settings() {
  return (
    <div className="space-y-12 py-10">
      <h2 className="headline text-3xl">Settings</h2>

      <SettingsProfileMetadata />

      <SettingsAccount />
    </div>
  );
}
