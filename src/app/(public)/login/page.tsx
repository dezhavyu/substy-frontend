import { LoginForm } from "@/features/auth/components/login-form";
import { PublicOnly } from "@/features/auth/components/public-only";

export default function LoginPage(): JSX.Element {
  return (
    <PublicOnly>
      <LoginForm />
    </PublicOnly>
  );
}
