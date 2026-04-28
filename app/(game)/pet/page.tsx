import { redirect } from "next/navigation";

/** Legacy route — onboarding lives at `/onboard`. */
export default function PetRedirectPage() {
  redirect("/onboard");
}
