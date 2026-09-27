import { FileCheck } from "lucide-react";
import { UitlegAgent } from "@/components/UitlegAgent";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function ContractagentPage() {
  usePageTitle("Contractagent — je contract uitgelegd");
  return <UitlegAgent soort="contract" icoon={<FileCheck size={22} />} />;
}
