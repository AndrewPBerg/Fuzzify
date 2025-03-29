// Define root domain interface
export interface DomainRoot {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  lastAnalyzed: string | null;
  isActive: boolean;
}

// Demo domain roots for testing
export const DEMO_DOMAIN_ROOTS: DomainRoot[] = [
  {
    id: "dr-1",
    name: "example.com",
    userId: "demo-user-1",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    lastAnalyzed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    isActive: true
  },
  {
    id: "dr-2",
    name: "acmetech.org",
    userId: "demo-user-1",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    lastAnalyzed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    isActive: true
  },
  {
    id: "dr-3",
    name: "securebank.com",
    userId: "demo-user-1",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    lastAnalyzed: null,
    isActive: true
  },
  {
    id: "dr-4",
    name: "techcorp.io",
    userId: "demo-user-1",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    lastAnalyzed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    isActive: true
  },
  {
    id: "dr-5",
    name: "cloudservices.net",
    userId: "demo-user-1",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    lastAnalyzed: null,
    isActive: true
  }
];

// Function to get domain roots for a specific user
export function getDomainRootsByUserId(userId: string): DomainRoot[] {
  return DEMO_DOMAIN_ROOTS.filter(domain => domain.userId === userId);
}

// Function to get a single domain root by its ID
export function getDomainRootById(id: string): DomainRoot | undefined {
  return DEMO_DOMAIN_ROOTS.find(domain => domain.id === id);
}

// Function to get a single domain root by its name
export function getDomainRootByName(name: string): DomainRoot | undefined {
  return DEMO_DOMAIN_ROOTS.find(domain => domain.name === name);
}

export default {
  domainRoots: DEMO_DOMAIN_ROOTS,
  getDomainRootsByUserId,
  getDomainRootById,
  getDomainRootByName
};
