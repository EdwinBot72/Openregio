import { JuridischePagina } from "@/components/JuridischePagina";
import { VOORWAARDEN } from "@/content/juridisch";

export default function VoorwaardenPage() {
  return <JuridischePagina doc={VOORWAARDEN} testId="page-voorwaarden" />;
}
