import { redirect } from "next/navigation";
import { routes } from "@/shared/lib/routes";

export default function HomePage(): never {
  redirect(routes.topics);
}
