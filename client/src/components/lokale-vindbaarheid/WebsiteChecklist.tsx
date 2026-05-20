import { useState, useEffect } from "react";
import { CHECKLIST_ITEMS } from "@shared/seo-data";
import { useAuth } from "@/hooks/useAuth";
import { Check } from "lucide-react";

const PRIORITEIT_CLASS = {
  hoog: "bg-destructive/10 text-destructive border-destructive/20",
  midden: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  laag: "bg-muted text-muted-foreground border-border",
};

export default function WebsiteChecklist() {
  const { user } = useAuth();
  const [afgevinkt, setAfgevinkt] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/seo-checklist/${user.id}`)
      .then((r) => r.json())
      .then((d) => setAfgevinkt(new Set(d.afgevinkt ?? [])))
      .catch(() => {});
  }, [user?.id]);

  async function toggle(id: string) {
    const nieuw = new Set(afgevinkt);
    nieuw.has(id) ? nieuw.delete(id) : nieuw.add(id);
    setAfgevinkt(nieuw);
    if (user?.id) {
      await fetch(`/api/seo-checklist/${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ afgevinkt: [...nieuw] }),
      }).catch(() => {});
    }
  }

  const voortgang = Math.round((afgevinkt.size / CHECKLIST_ITEMS.length) * 100);

  return (
    <div className="space-y-4 pt-4">
      <div>
        <div className="flex justify-between text-sm mb-1.5">
          <span className="text-muted-foreground">Voortgang</span>
          <span className="font-medium text-primary">
            {afgevinkt.size} / {CHECKLIST_ITEMS.length} punten
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${voortgang}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {CHECKLIST_ITEMS.map((item) => {
          const gedaan = afgevinkt.has(item.id);
          return (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              data-testid={`checklist-item-${item.id}`}
              className={`w-full text-left flex items-start gap-3 p-3 rounded-md border transition-colors ${
                gedaan
                  ? "bg-primary/5 border-primary/20"
                  : "bg-card border-border hover-elevate"
              }`}
            >
              <div
                className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                  gedaan
                    ? "bg-primary border-primary"
                    : "border-muted-foreground/40"
                }`}
              >
                {gedaan && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-sm font-medium ${
                      gedaan ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {item.titel}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded border ${PRIORITEIT_CLASS[item.prioriteit]}`}>
                    {item.prioriteit}
                  </span>
                </div>
                <p className={`text-xs mt-0.5 ${gedaan ? "text-muted-foreground/50" : "text-muted-foreground"}`}>
                  {item.uitleg}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
