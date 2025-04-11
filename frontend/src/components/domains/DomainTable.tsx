"use client";

import { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, Shield, ShieldAlert, ShieldCheck, ShieldX, Loader2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { usePermutations } from "@/lib/api/permuatations";
import { userStorage } from "@/lib/api/users";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Define domain interface
interface Domain {
  id?: number; // Added optional id field for React keys
  permutation_name: string;
  domain_name: string;
  fuzzer: string; // Add fuzzer field
  server: string | null;
  mail_server: string | null;
  ip_address: string | null;
  risk: number | null;
  risk_level: 'Unknown' | 'low' | 'medium' | 'high'; // Properly type risk_level
  tlsh: number | null; // Add tlsh field
  phash: number | null; // Add phash field
}

// Define permutations response interface
interface PermutationsResponse {
  permutations: Domain[];
}

interface Column {
  key: string;
  label: string;
}

const columns: Column[] = [
  { key: "permutation_name", label: "Permutation" },
  { key: "ip_address", label: "IP Address" },
  { key: "server", label: "Web Server" },
  { key: "mail_server", label: "Mail Server" },
  { key: "risk_level", label: "Risk Level" }
];

const threatIcons: Record<Domain['risk_level'], React.ReactNode> = {
  "high": <ShieldAlert className="text-rose-500" size={16} />,
  "medium": <ShieldAlert className="text-orange-500" size={16} />,
  "low": <ShieldCheck className="text-emerald-500" size={16} />,
  "Unknown": <ShieldX className="text-blue-500" size={16} />
};

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50];

const tooltipStyles = {
  content: "z-[999] bg-white dark:bg-gray-800 text-black dark:text-white p-2 rounded shadow-lg border border-gray-200 dark:border-gray-700 max-w-[250px]", 
  arrow: "fill-white dark:fill-gray-800"
}

export function DomainTable() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE_OPTIONS[0]);
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>("all");
  const [selectedDomainRoot, setSelectedDomainRoot] = useState<string | null>(() => {
    // Initialize from localStorage if available, otherwise null
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedDomain') || null;
    }
    return null;
  });
  const [domainRoots, setDomainRoots] = useState<string[]>([]);
  
  // Risk level options ordered from high to low
  const riskLevelOptions = [
    { value: "all", label: "All Risk Levels" },
    { value: "high", label: "High Risk" },
    { value: "medium", label: "Medium Risk" },
    { value: "low", label: "Low Risk" },
    { value: "Unknown", label: "Unknown Risk" }
  ];
  
  // Get userId from userStorage
  const { userId } = userStorage.getCurrentUser();
  
  // Use the permutations hook
  const { 
    data: permutationsData, 
    isLoading: permutationsLoading, 
    error: permutationsError 
  } = usePermutations(
    userId, 
    selectedDomainRoot || "",
  );

  // Fetch domain roots from localStorage
  useEffect(() => {
    const storedRoots = JSON.parse(localStorage.getItem("domainRoots") || "[]");
    setDomainRoots(storedRoots);
    
    // Add event listener for storage changes
    const handleStorageChange = () => {
      const updatedRoots = JSON.parse(localStorage.getItem("domainRoots") || "[]");
      setDomainRoots(updatedRoots);
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Update domains state when permutations data changes
  useEffect(() => {
    if (permutationsData) {
      // Check if the response has a permutations property (from backend API)
      // or if it's already an array of permutation objects
      const permutationsArray = Array.isArray(permutationsData) 
        ? permutationsData as Domain[]
        : (permutationsData as PermutationsResponse).permutations || [];
      
      // Transform data to match our Domain interface
      const transformedData = permutationsArray.map((item: any, index: number) => {
        // Ensure risk_level is one of the valid types
        const validRiskLevel = (item.risk_level === 'low' || 
                               item.risk_level === 'medium' || 
                               item.risk_level === 'high') 
                               ? item.risk_level 
                               : 'Unknown' as const;
                              
        // Debug the values being received
        if (process.env.NODE_ENV === 'development') {
          console.log(`Permutation item ${index}:`, {
            tlsh: item.tlsh,
            phash: item.phash,
            risk: item.risk,
            risk_level: item.risk_level
          });
        }
                              
        return {
          id: index + 1,
          permutation_name: item.permutation_name,
          domain_name: item.domain_name,
          fuzzer: item.fuzzer || "", 
          server: item.server,
          mail_server: item.mail_server,
          risk: typeof item.risk === 'number' ? item.risk : null,
          risk_level: validRiskLevel,
          ip_address: item.ip_address,
          tlsh: typeof item.tlsh === 'number' ? item.tlsh : null,
          phash: typeof item.phash === 'number' ? item.phash : null
        } as Domain;
      });
      
      setDomains(transformedData);
    } else if (!selectedDomainRoot) {
      setDomains([]);
    }
  }, [permutationsData, selectedDomainRoot]);

  // Update loading and error states based on the query
  useEffect(() => {
    setLoading(permutationsLoading);
    
    if (permutationsError) {
      const errorMessage = permutationsError instanceof Error 
        ? permutationsError.message 
        : 'Failed to fetch domain permutations';
      
      setError(errorMessage);
      toast.error("Error", {
        description: errorMessage,
      });
    } else {
      setError(null);
    }
  }, [permutationsLoading, permutationsError]);

  // Apply filters and search
  const filteredDomains = domains.filter(domain => {
    // Apply search filter
    const matchesSearch = Object.values(domain).some(
      value => value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Apply risk level filter
    const matchesRiskLevel = selectedRiskLevel === "all" || domain.risk_level === selectedRiskLevel;
    
    return matchesSearch && matchesRiskLevel;
  });

  // Sort domains by risk level (high > medium > low > Unknown)
  const sortedDomains = [...filteredDomains].sort((a, b) => {
    // Create an explicit order map with numeric values
    const riskOrder: Record<string, number> = { 
      "high": 0, 
      "medium": 1, 
      "low": 2, 
      "Unknown": 3 
    };
    
    // Get the numeric values for each risk level, defaulting to 3 (Unknown) if not found
    const aValue = typeof a.risk_level === 'string' ? (riskOrder[a.risk_level] ?? 3) : 3;
    const bValue = typeof b.risk_level === 'string' ? (riskOrder[b.risk_level] ?? 3) : 3;
    
    // Sort by the numeric values (lower values first)
    return aValue - bValue;
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedDomains.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = sortedDomains.slice(startIndex, endIndex);

  // Reset to first page when filters or items per page change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDomainRoot, selectedRiskLevel, itemsPerPage]);

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
    setSelectedRiskLevel("all");
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="glass-card rounded-lg overflow-hidden shadow-sm animate-scale-in">
        <div className="p-4 border-b border-border/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            {/* Risk Level Filter */}
            <div>
              <select
                value={selectedRiskLevel}
                onChange={(e) => setSelectedRiskLevel(e.target.value)}
                className="w-full p-2 text-sm bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/50"
              >
                {riskLevelOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
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
          {(searchQuery || selectedRiskLevel !== "all") && (
            <div className="flex justify-end mt-3">
              <button
                onClick={clearFilters}
                className="text-xs py-1 px-2.5 text-muted-foreground border border-border/50 rounded-lg hover:bg-background transition-colors"
              >
                Clear Filters
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div className="text-sm font-medium">{domain.permutation_name}</div>
                        <a 
                          href={`https://${domain.permutation_name}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                          title={`Visit ${domain.permutation_name}`}
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                      <div className="text-xs text-muted-foreground">{domain.fuzzer}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {domain.ip_address || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {domain.server || ""}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {domain.mail_server || ""}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-1.5">
                        {threatIcons[domain.risk_level] || threatIcons["Unknown"]}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium cursor-pointer",
                              domain.risk_level === "high" && "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400",
                              domain.risk_level === "medium" && "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400",
                              domain.risk_level === "low" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
                              domain.risk_level === "Unknown" && "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                            )}>
                              {domain.risk_level}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className={tooltipStyles.content}>
                            <div>
                              <div className="font-medium text-sm mb-1">Similarity Metrics</div>
                              <div className="space-y-1 text-xs">
                                <div><span className="font-medium">TLSH:</span> {domain.tlsh !== null ? domain.tlsh : 'N/A'}</div>
                                <div><span className="font-medium">pHash:</span> {domain.phash !== null ? domain.phash : 'N/A'}</div>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
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
                Showing {currentPageData.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, sortedDomains.length)} of {sortedDomains.length} domains
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
    </TooltipProvider>
  );
}
