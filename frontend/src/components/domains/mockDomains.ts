// Mock data for domain table with threat levels
const mockDomains = [
  {
    id: 1,
    name: "example.com",
    ip: "192.168.1.1",
    created: "2023-05-10",
    owner: "John Doe",
    status: "active",
    threatLevel: "secure"
  },
  {
    id: 2,
    name: "test-domain.com",
    ip: "192.168.1.2",
    created: "2023-06-15",
    owner: "Jane Smith",
    status: "active",
    threatLevel: "warning"
  },
  {
    id: 3,
    name: "demo-site.net",
    ip: "192.168.1.3",
    created: "2023-07-20",
    owner: "Alex Johnson",
    status: "inactive",
    threatLevel: "secure"
  },
  {
    id: 4,
    name: "my-app.io",
    ip: "192.168.1.4",
    created: "2023-08-05",
    owner: "Sam Wilson",
    status: "pending",
    threatLevel: "critical"
  },
  {
    id: 5,
    name: "new-project.co",
    ip: "192.168.1.5",
    created: "2023-09-12",
    owner: "Taylor Lee",
    status: "active",
    threatLevel: "false-positive"
  }
];

export default mockDomains; 