import { RegisterForm } from "@/features/auth/components/register-form";
import { PublicOnly } from "@/features/auth/components/public-only";

export default function RegisterPage(): JSX.Element {
  return (
    <PublicOnly>
      <RegisterForm />
    </PublicOnly>
  );
}
