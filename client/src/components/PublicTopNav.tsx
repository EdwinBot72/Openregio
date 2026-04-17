import { Link } from "wouter";

interface PublicTopNavProps {
  showWordLid?: boolean;
}

export function PublicTopNav({ showWordLid = true }: PublicTopNavProps) {
  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-lg border-b"
      style={{ background: "rgba(244,246,251,.92)", borderColor: "#e6ebf2" }}
      data-testid="nav-public-top"
    >
      <div className="max-w-[1120px] mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" data-testid="link-home-logo">
          <span className="openregio-topnav-logo" style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-.4px" }}>
            <span className="openregio-topnav-logo-dark">Open</span>
            <span className="openregio-topnav-logo-blue">Regio</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/blogs">
            <button className="openregio-button openregio-button-outline openregio-button-small" data-testid="link-nav-blogs">
              Blogs
            </button>
          </Link>
          <Link href="/login">
            <button className="openregio-button openregio-button-outline openregio-button-small" data-testid="button-nav-login">
              Inloggen
            </button>
          </Link>
          {showWordLid && (
            <Link href="/lidmaatschap">
              <button className="openregio-button openregio-button-primary openregio-button-small" data-testid="button-nav-word-lid">
                Word lid
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
