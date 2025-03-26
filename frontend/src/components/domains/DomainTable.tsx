"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Search, ChevronLeft, ChevronRight, Shield, ShieldAlert, ShieldCheck, ShieldX, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Define domain interface
interface Domain {
  id: number;
  name: string;
  ip: string;
  created: string;
  owner: string;
  status: string;
  threatLevel: string;
}

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
}

const columns: Column[] = [
  { key: "name", label: "Domain Name", sortable: true },
  { key: "ip", label: "IP Address", sortable: true },
  { key: "created", label: "Created Date", sortable: true },
  { key: "owner", label: "Owner", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "threatLevel", label: "Threat Level", sortable: true }
];

const threatIcons = {
  critical: <ShieldAlert className="text-rose-500" size={16} />,
  warning: <ShieldAlert className="text-amber-500" size={16} />,
  secure: <ShieldCheck className="text-emerald-500" size={16} />,
  "false-positive": <ShieldX className="text-blue-500" size={16} />
};

const ITEMS_PER_PAGE = 5;

export function DomainTable() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    status: "",
    threatLevel: ""
  });
  const [selectedDomainRoot, setSelectedDomainRoot] = useState<string | null>(null);
  const [domainRoots, setDomainRoots] = useState<string[]>([]);

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

  // Fetch domain permutations when a domain root is selected
  useEffect(() => {
    if (!selectedDomainRoot) {
      // No domain root selected, just set empty domains and stop loading
      setDomains([]);
      setLoading(false);
      return;
    }

    const fetchDomainPermutations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/domains/permutations?domain=${selectedDomainRoot}`);
        
        if (!response.ok) {
          throw new Error(`Error fetching domain permutations: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Transform the data to match our domain interface
        const transformedData = data.map((item: any, index: number) => ({
          id: index + 1,
          name: item.domain || item.name,
          ip: item.ip,
          created: item.created,
          owner: item.owner,
          status: item.status,
          threatLevel: item.threatLevel
        }));
        
        setDomains(transformedData);
      } catch (error) {
        console.error('Error fetching domain permutations:', error);
        setError('Failed to fetch domain permutations. Please try again.');
        toast.error("Error", {
          description: "Failed to fetch domain permutations. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDomainPermutations();
  }, [selectedDomainRoot]);

  // Handle sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Apply filters and search
  const filteredDomains = domains.filter(domain => {
    // Apply search filter
    const matchesSearch = Object.values(domain).some(
      value => value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Apply status filter
    const matchesStatus = filters.status === "" || domain.status === filters.status;
    
    // Apply threat level filter
    const matchesThreatLevel = filters.threatLevel === "" || domain.threatLevel === filters.threatLevel;
    
    return matchesSearch && matchesStatus && matchesThreatLevel;
  });

  // Sort filtered domains
  const sortedDomains = [...filteredDomains].sort((a, b) => {
    // @ts-ignore - dynamic property access
    const aValue = a[sortColumn];
    // @ts-ignore - dynamic property access
    const bValue = b[sortColumn];
    
    if (sortDirection === "asc") {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedDomains.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPageData = sortedDomains.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters, selectedDomainRoot]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle filter changes
  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: "",
      threatLevel: ""
    });
    setSearchQuery("");
  };

  return (
    <div className="glass-card rounded-lg overflow-hidden shadow-sm animate-scale-in">
      <div className="p-4 border-b border-border/50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Domain Root Selector */}
          <div className="md:col-span-2">
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
          <div className="relative md:col-span-2">
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
          
          {/* Status filter */}
          <div>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full p-2 text-sm bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/50"
            >
              <option value="">Filter by Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          
          {/* Threat Level filter */}
          <div>
            <select
              value={filters.threatLevel}
              onChange={(e) => handleFilterChange("threatLevel", e.target.value)}
              className="w-full p-2 text-sm bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/50"
            >
              <option value="">Filter by Threat Level</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="secure">Secure</option>
              <option value="false-positive">False Positive</option>
            </select>
          </div>
        </div>
        
        {/* Clear filters button */}
        {(filters.status || filters.threatLevel || searchQuery) && (
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
                    className={cn(
                      "px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider",
                      column.sortable && "cursor-pointer hover:text-foreground"
                    )}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-1">
                      {column.label}
                      {column.sortable && sortColumn === column.key && (
                        <span className="text-foreground">
                          {sortDirection === "asc" ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )}
                        </span>
                      )}
                    </div>
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
                    {domain.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {domain.ip}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {domain.created}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {domain.owner}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      domain.status === "active" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
                      domain.status === "inactive" && "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400",
                      domain.status === "pending" && "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                    )}>
                      {domain.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-1.5">
                      {threatIcons[domain.threatLevel as keyof typeof threatIcons]}
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        domain.threatLevel === "critical" && "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400",
                        domain.threatLevel === "warning" && "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
                        domain.threatLevel === "secure" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
                        domain.threatLevel === "false-positive" && "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                      )}>
                        {domain.threatLevel === "false-positive" ? "False Positive" : 
                          domain.threatLevel.charAt(0).toUpperCase() + domain.threatLevel.slice(1)}
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
          <div className="text-sm text-muted-foreground">
            Showing {currentPageData.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, sortedDomains.length)} of {sortedDomains.length} domains
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              className="p-1 rounded-md border border-border/50 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={cn(
                    "w-8 h-8 rounded-md text-sm",
                    page === currentPage 
                      ? "bg-primary text-primary-foreground" 
                      : "border border-border/50 hover:bg-muted/20"
                  )}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              className="p-1 rounded-md border border-border/50 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
