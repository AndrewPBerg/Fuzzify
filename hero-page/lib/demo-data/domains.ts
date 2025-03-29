// Domain and permutation types matching the frontend interfaces
export interface Domain {
  domain_name: string;
  user_id: string;
  last_scan?: string | null;
  total_scans: number;
  ip_address?: string | null;
  server?: string | null;
  mail_server?: string | null;
}

export interface Permutation {
  permutation_name: string;  // Primary key
  domain_name: string;      // Foreign key to domain
  server: string | null;    // Web server for variation
  mail_server: string | null; // Mail server for variation
  risk: boolean | null;     // High risk? True/False
  ip_address: string | null; // Associated IP address
}

// Mock domains for static demo
export const DEMO_DOMAINS: Domain[] = [
  {
    domain_name: "example.com",
    user_id: "demo-user-1",
    last_scan: new Date().toISOString(),
    total_scans: 12,
    ip_address: "192.168.1.1",
    server: "Apache/2.4.41",
    mail_server: "Exchange"
  },
  {
    domain_name: "acmetech.org",
    user_id: "demo-user-1",
    last_scan: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    total_scans: 8,
    ip_address: "10.0.0.1",
    server: "nginx/1.18.0",
    mail_server: "Postfix"
  },
  {
    domain_name: "demo-site.io",
    user_id: "demo-user-1",
    last_scan: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    total_scans: 5,
    ip_address: "172.16.0.1",
    server: "IIS/10.0",
    mail_server: null
  }
];

// Mock permutations for static demo
export const DEMO_PERMUTATIONS: Permutation[] = [
  // Permutations for example.com
  {
    permutation_name: "examp1e.com",
    domain_name: "example.com",
    server: "Apache/2.4.0",
    mail_server: null,
    risk: true,
    ip_address: "103.45.67.89"
  },
  {
    permutation_name: "exampl3.com",
    domain_name: "example.com",
    server: "nginx/1.18.0",
    mail_server: "Postfix",
    risk: true,
    ip_address: "45.67.89.101"
  },
  {
    permutation_name: "examplec.com",
    domain_name: "example.com",
    server: null,
    mail_server: null,
    risk: false,
    ip_address: null
  },
  
  // Permutations for acmetech.org
  {
    permutation_name: "acmetech.com",
    domain_name: "acmetech.org",
    server: "nginx/1.19.0",
    mail_server: "Postfix",
    risk: true,
    ip_address: "45.12.34.56"
  },
  {
    permutation_name: "acme-tech.org",
    domain_name: "acmetech.org",
    server: null,
    mail_server: null,
    risk: false,
    ip_address: null
  },
  
  // Permutations for demo-site.io
  {
    permutation_name: "demosite.io",
    domain_name: "demo-site.io",
    server: "Cloudflare",
    mail_server: null,
    risk: true,
    ip_address: "104.16.0.1"
  },
  {
    permutation_name: "demo-s1te.io",
    domain_name: "demo-site.io",
    server: null,
    mail_server: null,
    risk: false,
    ip_address: null
  }
];

// Function to get domains for a specific user
export function getDomainsByUserId(userId: string): Domain[] {
  return DEMO_DOMAINS.filter(domain => domain.user_id === userId);
}

// Function to get permutations for a specific domain
export function getPermutationsByDomain(domainName: string): Permutation[] {
  return DEMO_PERMUTATIONS.filter(perm => perm.domain_name === domainName);
}

// Function to get all permutations for a user's domains
export function getAllPermutationsByUserId(userId: string): Permutation[] {
  const userDomainNames = getDomainsByUserId(userId).map(d => d.domain_name);
  return DEMO_PERMUTATIONS.filter(perm => userDomainNames.includes(perm.domain_name));
}

export default {
  domains: DEMO_DOMAINS,
  permutations: DEMO_PERMUTATIONS,
  getDomainsByUserId,
  getPermutationsByDomain,
  getAllPermutationsByUserId
}; 