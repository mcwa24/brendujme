import { redirect } from "next/navigation";

export default function SubmitBrandPage() {
  redirect("/contact?topic=brand");
}
