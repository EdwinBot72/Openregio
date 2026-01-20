import { useEffect } from "react";
import { useLocation, useSearch } from "wouter";

export default function StartPage() {
  const [, setLocation] = useLocation();
  const searchParams = useSearch();
  
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const plan = params.get("plan") || "basic";
    const ref = params.get("ref");
    
    // Pass referral code to lidmaatschap page if present
    let url = `/lidmaatschap?plan=${plan}`;
    if (ref) {
      url += `&ref=${encodeURIComponent(ref)}`;
    }
    setLocation(url);
  }, [searchParams, setLocation]);
  
  return null;
}
