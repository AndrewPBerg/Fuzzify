"use client";

import { DomainRootForm } from "./DomainRootForm";
import { DomainRootsList } from "./DomainRootsList";

export function DomainRootsManager() {
  return (
    <div className="glass-card rounded-lg p-4 mb-6 shadow-sm animate-scale-in">
      <h2 className="text-lg font-medium mb-3">Domain Roots</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Add and manage domain roots for monitoring. These are separate from domains listed in the table.
      </p>
      <DomainRootForm />
      <DomainRootsList />
    </div>
  );
}
