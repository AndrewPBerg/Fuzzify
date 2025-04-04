"use client";

import { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, Shield, ShieldAlert, ShieldCheck, ShieldX, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DEMO_DOMAIN_ROOTS } from "@/lib/demo-data/domain";
import domainsData, { Permutation } from "@/lib/demo-data/domains";

// Define domain interface
interface Domain {
  id?: number; // Added optional id field for React keys
  permutation_name: string;
  domain_name: string;
  server: string | null;
  mail_server: string | null;
  risk: boolean | null;
  ip_address: string | null;
}

interface Column {
  key: string;
  label: string;
}

const columns: Column[] = [
  { key: "permutation_name", label: "Permutation Name" },
  { key: "domain_name", label: "Domain Root" },
  { key: "ip_address", label: "IP Address" },
  { key: "server", label: "Web Server" },
  { key: "mail_server", label: "Mail Server" },
  { key: "risk", label: "Risk Level" }
];

const threatIcons = {
  true: <ShieldAlert className="text-rose-500" size={16} />,
  false: <ShieldCheck className="text-emerald-500" size={16} />,
  null: <ShieldX className="text-blue-500" size={16} />
};

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50];

export function DomainTable() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE_OPTIONS[0]);
  const [selectedDomainRoot, setSelectedDomainRoot] = useState<string | null>(null);
  const [domainRoots, setDomainRoots] = useState<string[]>([]);
  
  // Load domain roots
  useEffect(() => {
    try {
      // Get domains from demo data
      const domainNames = DEMO_DOMAIN_ROOTS.map(domain => domain.name);
      
      // Set domain roots
      setDomainRoots(domainNames);
      
      // Select the first domain by default if there is one
      if (domainNames.length > 0 && !selectedDomainRoot) {
        setSelectedDomainRoot(domainNames[0]);
      }
    } catch (error) {
      console.error("Error loading domain roots:", error);
      toast.error("Error", {
        description: "Failed to load domain roots",
      });
    }
  }, [selectedDomainRoot]);

  // Load permutations when selectedDomainRoot changes
  useEffect(() => {
    if (!selectedDomainRoot) {
      setDomains([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    // Simulate network delay for demo
    const timer = setTimeout(() => {
      try {
        // Get permutations for selected domain from demo data
        const permutations = domainsData.getPermutationsByDomain(selectedDomainRoot);
        
        // Transform to match our Domain interface
        const transformedData = permutations.map((item, index) => ({
          id: index + 1,
          permutation_name: item.permutation_name,
          domain_name: item.domain_name,
          server: item.server,
          mail_server: item.mail_server,
          risk: item.risk,
          ip_address: item.ip_address
        }));
        
        setDomains(transformedData);
        setLoading(false);
        setError(null);
      } catch (error) {
        console.error("Error loading permutations:", error);
        setError("Failed to load permutations");
        toast.error("Error", {
          description: "Failed to load permutations",
        });
        setLoading(false);
      }
    }, 800);
    
    return () => clearTimeout(timer);
  }, [selectedDomainRoot]);

  // Apply filters and search
  const filteredDomains = domains.filter(domain => {
    // Apply search filter
    const matchesSearch = Object.values(domain).some(
      value => value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    return matchesSearch;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredDomains.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = filteredDomains.slice(startIndex, endIndex);

  // Reset to first page when filters or items per page change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDomainRoot, itemsPerPage]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
  };

  // Generate page numbers to display with ellipses for long ranges
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5; // Max number of page buttons to show

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);

      // Calculate range around current page
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if at start or end
      if (currentPage <= 2) {
        endPage = Math.min(4, totalPages - 1);
      } else if (currentPage >= totalPages - 1) {
        startPage = Math.max(2, totalPages - 3);
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push('ellipsis-start');
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push('ellipsis-end');
      }

      // Always show last page
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery("");
  };

  return (
    <div className="glass-card rounded-lg overflow-hidden shadow-sm animate-scale-in">
      <div className="p-4 border-b border-border/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Domain Root Selector */}
          <div>
            <select
              value={selectedDomainRoot || ""}
              onChange={(e) => setSelectedDomainRoot(e.target.value || null)}
              className="w-full p-2 text-sm bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/50"
            >
              <option value="">Select Domain Root</option>
              {domainRoots.map((root) => (
                <option key={root} value={root}>{root}</option>
              ))}
            </select>
          </div>
          
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
              <Search size={16} />
            </div>
            <input
              type="text"
              className="pl-10 pr-4 py-2 bg-background/50 border border-border/50 rounded-lg text-sm w-full focus:outline-none focus:ring-1 focus:ring-primary/50"
              placeholder="Search domains..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Clear filters button */}
        {searchQuery && (
          <div className="flex justify-end mt-3">
            <button
              onClick={clearFilters}
              className="text-xs py-1 px-2.5 text-muted-foreground border border-border/50 rounded-lg hover:bg-background transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading domain data...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <ShieldAlert className="h-8 w-8 text-rose-500 mb-4" />
            <p className="text-muted-foreground mb-2">{error}</p>
            <button 
              onClick={() => setSelectedDomainRoot(selectedDomainRoot)}
              className="text-xs py-1.5 px-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : domains.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Shield className="h-8 w-8 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No domains found.</p>
            {!selectedDomainRoot && domainRoots.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Please select a domain root to view permutations.
              </p>
            )}
            {domainRoots.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Add domain roots in the Domain Roots section above.
              </p>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-muted/30">
                {columns.map((column) => (
                  <th 
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {currentPageData.map((domain) => (
                <tr 
                  key={domain.id}
                  className="hover:bg-muted/20 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {domain.permutation_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {domain.domain_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {domain.ip_address || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {domain.server || "Unknown"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {domain.mail_server || "Unknown"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-1.5">
                      {domain.risk === true ? 
                        threatIcons.true : 
                        domain.risk === false ? 
                          threatIcons.false : 
                          threatIcons.null}
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        domain.risk === true && "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400",
                        domain.risk === false && "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
                        domain.risk === null && "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                      )}>
                        {domain.risk === true ? "High Risk" : 
                          domain.risk === false ? "Low Risk" : "Unknown"}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination - only show if we have data */}
      {!loading && !error && domains.length > 0 && (
        <div className="p-4 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Showing {currentPageData.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredDomains.length)} of {filteredDomains.length} domains
            </span>
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">Rows:</span>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="py-1 px-2 text-xs bg-background/50 border border-border/50 rounded focus:outline-none focus:ring-1 focus:ring-primary/50"
              >
                {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              className="p-1 rounded-md border border-border/50 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={14} />
            </button>
            
            <div className="flex items-center space-x-1">
              {getPageNumbers().map((page, index) => (
                typeof page === 'number' ? (
                  <button
                    key={`page-${page}`}
                    onClick={() => handlePageChange(page)}
                    className={cn(
                      "min-w-7 h-7 rounded-md text-xs",
                      page === currentPage 
                        ? "bg-primary text-primary-foreground" 
                        : "border border-border/50 hover:bg-muted/20"
                    )}
                  >
                    {page}
                  </button>
                ) : (
                  <span key={`ellipsis-${index}`} className="w-7 text-center">…</span>
                )
              ))}
            </div>
            
            <button
              className="p-1 rounded-md border border-border/50 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
