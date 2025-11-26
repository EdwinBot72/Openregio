import { useEffect } from "react";
import { useLocation, useSearch } from "wouter";

export default function StartPage() {
  const [, setLocation] = useLocation();
  const searchParams = useSearch();
  
  useEffect(() => {
    const plan = new URLSearchParams(searchParams).get("plan") || "basic";
    setLocation(`/lidmaatschap?plan=${plan}`);
  }, [searchParams, setLocation]);
  
  return null;
}
