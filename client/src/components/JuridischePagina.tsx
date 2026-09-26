import { Fragment, type ReactNode } from "react";
import { Link } from "wouter";
import { PublicTopNav } from "@/components/PublicTopNav";
import type { JuridischDocument, Blok } from "@/content/juridisch";

// **vet**, [tekst](url) en nog in te vullen [● …] (geel gemarkeerd).
function Inline({ tekst }: { tekst: string }) {
  const delen = tekst.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|\[●[^\]]*\])/g);
  return (
    <>
      {delen.map((d, i) => {
        if (d.startsWith("**") && d.endsWith("**")) return <strong key={i}>{d.slice(2, -2)}</strong>;
        const link = d.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (link) {
          const [, label, href] = link;
          return href.startsWith("/")
            ? <Link key={i} href={href} style={{ color: "#0b2240", fontWeight: 700 }}>{label}</Link>
            : <a key={i} href={href} target="_blank" rel="noopener noreferrer" style={{ color: "#0b2240", fontWeight: 700 }}>{label}</a>;
        }
        if (d.startsWith("[●")) return <mark key={i} style={{ background: "#fff3b0", padding: "0 3px" }}>{d}</mark>;
        return <Fragment key={i}>{d}</Fragment>;
      })}
    </>
  );
}

function BlokWeergave({ blok }: { blok: Blok }): ReactNode {
  if ("p" in blok) return <p><Inline tekst={blok.p} /></p>;
  if ("h3" in blok) return <h3>{blok.h3}</h3>;
  if ("let" in blok) return <div className="openregio-soft-box"><p><Inline tekst={blok.let} /></p></div>;
  return <ul>{blok.ul.map((li, i) => <li key={i}><Inline tekst={li} /></li>)}</ul>;
}

export function JuridischePagina({ doc, testId }: { doc: JuridischDocument; testId: string }) {
  return (
    <div className="openregio-public-page" data-testid={testId}>
      <PublicTopNav />
      <div className="openregio-public-content">
        <h1 className="openregio-public-title">{doc.titel}</h1>
        <p className="openregio-public-lead">Versie {doc.versie} — bijgewerkt op {doc.bijgewerkt}</p>
        {doc.intro.map((t, i) => (
          <section key={i} className="openregio-public-card" style={{ background: "#eff5fc", border: "1px solid #cfe0f5" }}>
            <p><Inline tekst={t} /></p>
          </section>
        ))}
        {doc.secties.map((s) => (
          <section key={s.titel} className="openregio-public-card">
            <h2>{s.titel}</h2>
            {s.blokken.map((b, i) => <BlokWeergave key={i} blok={b} />)}
          </section>
        ))}
      </div>
    </div>
  );
}
