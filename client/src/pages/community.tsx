import { useEffect } from "react";
import { useLocation } from "wouter";

export default function CommunityPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation("/network");
  }, [setLocation]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <p className="text-muted-foreground">Doorverwijzen naar Netwerk...</p>
    </div>
  );
}
