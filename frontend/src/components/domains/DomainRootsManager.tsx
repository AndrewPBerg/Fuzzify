"use client";

import { DomainRootForm } from "./DomainRootForm";
import { DomainRootsList } from "./DomainRootsList";
import { DomainRootRun } from "./DomainRootRun";

export function DomainRootsManager() {
  return (
    <div className="glass-card rounded-lg p-4 mb-6 shadow-sm animate-scale-in">
      <h2 className="text-lg font-medium mb-3">Domain Roots</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Add and manage domain roots for monitoring. These are separate from domains listed in the table.
      </p>
      
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <DomainRootForm />
          
          <DomainRootRun 
            onSuccess={() => window.dispatchEvent(new Event('storage'))} 
            compact={true}
          />
        </div>
      </div>
    
      <DomainRootsList />
    </div>
  );
}
