import { ThemeSwitcher } from '@/components/settings/theme-switcher';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Theme</h3>
        <p className="text-sm text-muted-foreground">Select the theme for the application.</p>
      </div>
      <ThemeSwitcher />
    </div>
  );
}
