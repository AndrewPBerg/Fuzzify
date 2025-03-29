import { DomainTable } from "@/components/domains/DomainTable";
import { DomainRootsManager } from "@/components/domains/DomainRootsManager";

export default function DomainsPage() {
  return (
    <div className="page-container">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Domains</h1>
        <p className="text-muted-foreground mt-1">
          Manage and monitor all your registered domains
        </p>
      </div>

      {/* Domain Roots Manager */}
      <DomainRootsManager />

      {/* Domain table */}
      <DomainTable />
    </div>
  );
} 