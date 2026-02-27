import { PreferencesForm } from "@/features/preferences/components/preferences-form";
import { PageContainer } from "@/shared/ui/page-container";

export default function PreferencesPage(): JSX.Element {
  return (
    <PageContainer
      title="Preferences"
      description="Control delivery channels, quiet hours and timezone settings."
    >
      <PreferencesForm />
    </PageContainer>
  );
}
