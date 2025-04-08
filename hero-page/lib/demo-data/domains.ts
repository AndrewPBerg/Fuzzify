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
  },
  {
    domain_name: "securebank.com",
    user_id: "demo-user-1",
    last_scan: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    total_scans: 15,
    ip_address: "45.67.89.123",
    server: "nginx/1.20.0",
    mail_server: "Exchange"
  },
  {
    domain_name: "techcorp.io",
    user_id: "demo-user-1",
    last_scan: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    total_scans: 9,
    ip_address: "78.90.12.34",
    server: "Apache/2.4.46",
    mail_server: "Postfix"
  },
  {
    domain_name: "cloudservices.net",
    user_id: "demo-user-1",
    last_scan: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    total_scans: 6,
    ip_address: "23.45.67.89",
    server: "Cloudflare",
    mail_server: "Exchange"
  },
  {
    domain_name: "healthcare.org",
    user_id: "demo-user-1",
    last_scan: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    total_scans: 7,
    ip_address: "56.78.90.12",
    server: "nginx/1.19.0",
    mail_server: "Postfix"
  },
  {
    domain_name: "fintech-solutions.com",
    user_id: "demo-user-1",
    last_scan: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
    total_scans: 4,
    ip_address: "34.56.78.90",
    server: "Apache/2.4.41",
    mail_server: null
  },
  {
    domain_name: "retail-store.net",
    user_id: "demo-user-1",
    last_scan: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
    total_scans: 3,
    ip_address: "12.34.56.78",
    server: "IIS/10.0",
    mail_server: "Exchange"
  },
  {
    domain_name: "education-portal.org",
    user_id: "demo-user-1",
    last_scan: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(), // 9 days ago
    total_scans: 2,
    ip_address: "90.12.34.56",
    server: "nginx/1.18.0",
    mail_server: "Postfix"
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
  },

  // Permutations for securebank.com
  {
    permutation_name: "secureb4nk.com",
    domain_name: "securebank.com",
    server: "nginx/1.20.0",
    mail_server: "Exchange",
    risk: true,
    ip_address: "45.67.89.123"
  },
  {
    permutation_name: "secure-bank.com",
    domain_name: "securebank.com",
    server: null,
    mail_server: null,
    risk: false,
    ip_address: null
  },

  // Permutations for techcorp.io
  {
    permutation_name: "techcorp.com",
    domain_name: "techcorp.io",
    server: "Apache/2.4.46",
    mail_server: "Postfix",
    risk: true,
    ip_address: "78.90.12.34"
  },
  {
    permutation_name: "tech-corp.io",
    domain_name: "techcorp.io",
    server: null,
    mail_server: null,
    risk: false,
    ip_address: null
  },

  // Permutations for cloudservices.net
  {
    permutation_name: "cloudserv1ces.net",
    domain_name: "cloudservices.net",
    server: "Cloudflare",
    mail_server: "Exchange",
    risk: true,
    ip_address: "23.45.67.89"
  },
  {
    permutation_name: "cloud-services.net",
    domain_name: "cloudservices.net",
    server: null,
    mail_server: null,
    risk: false,
    ip_address: null
  },

  // Permutations for healthcare.org
  {
    permutation_name: "healthc4re.org",
    domain_name: "healthcare.org",
    server: "nginx/1.19.0",
    mail_server: "Postfix",
    risk: true,
    ip_address: "56.78.90.12"
  },
  {
    permutation_name: "health-care.org",
    domain_name: "healthcare.org",
    server: null,
    mail_server: null,
    risk: false,
    ip_address: null
  },

  // Permutations for fintech-solutions.com
  {
    permutation_name: "fintechsolutions.com",
    domain_name: "fintech-solutions.com",
    server: "Apache/2.4.41",
    mail_server: null,
    risk: true,
    ip_address: "34.56.78.90"
  },
  {
    permutation_name: "fintech-solut1ons.com",
    domain_name: "fintech-solutions.com",
    server: null,
    mail_server: null,
    risk: false,
    ip_address: null
  },

  // Permutations for retail-store.net
  {
    permutation_name: "reta1l-store.net",
    domain_name: "retail-store.net",
    server: "IIS/10.0",
    mail_server: "Exchange",
    risk: true,
    ip_address: "12.34.56.78"
  },
  {
    permutation_name: "retailstore.net",
    domain_name: "retail-store.net",
    server: null,
    mail_server: null,
    risk: false,
    ip_address: null
  },

  // Permutations for education-portal.org
  {
    permutation_name: "educat1on-portal.org",
    domain_name: "education-portal.org",
    server: "nginx/1.18.0",
    mail_server: "Postfix",
    risk: true,
    ip_address: "90.12.34.56"
  },
  {
    permutation_name: "educationportal.org",
    domain_name: "education-portal.org",
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