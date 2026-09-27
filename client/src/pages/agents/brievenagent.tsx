import { Mail } from "lucide-react";
import { UitlegAgent } from "@/components/UitlegAgent";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function BrievenagentPage() {
  usePageTitle("Brievenagent — je brief uitgelegd");
  return <UitlegAgent soort="brief" icoon={<Mail size={22} />} />;
}
