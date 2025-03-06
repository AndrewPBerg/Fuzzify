"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Globe2 } from "lucide-react";

interface DomainInfo {
  extension: string;
  registrar: string;
  availability: string;
  "registration-date": string | null;
  "ip-address": string | null;
}

interface DomainData {
  "domain-root": string;
  permutations: {
    [key: string]: DomainInfo;
  };
}

const data: DomainData = {
  "domain-root": "example.com",
  permutations: {
    "examp1e.com": {
      extension: ".com",
      registrar: "GoDaddy",
      availability: "registered",
      "registration-date": "2023-01-15",
      "ip-address": "192.0.2.1",
    },
    "examp1e.net": {
      extension: ".net",
      registrar: "Namecheap",
      availability: "available",
      "registration-date": null,
      "ip-address": null,
    },
    "examp1e.org": {
      extension: ".org",
      registrar: "Bluehost",
      availability: "registered",
      "registration-date": "2022-11-20",
      "ip-address": "203.0.113.5",
    },
    "examp1e.co": {
      extension: ".co",
      registrar: "Google Domains",
      availability: "available",
      "registration-date": null,
      "ip-address": null,
    },
    "examp1e.info": {
      extension: ".info",
      registrar: "HostGator",
      availability: "registered",
      "registration-date": "2023-03-10",
      "ip-address": "198.51.100.10",
    },
  },
};

export default function DomainsPage() {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Domain</TableHead>
            <TableHead>Registrar</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Registration Date</TableHead>
            <TableHead>IP Address</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(data.permutations).map(([domain, info]) => (
            <TableRow key={domain}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Globe2 className="h-4 w-4 text-muted-foreground" />
                  {domain}
                </div>
              </TableCell>
              <TableCell>{info.registrar}</TableCell>
              <TableCell>
                <Badge
                  variant={info.availability === "registered" ? "destructive" : "success"}
                >
                  {info.availability}
                </Badge>
              </TableCell>
              <TableCell>
                {info["registration-date"] || "-"}
              </TableCell>
              <TableCell>
                {info["ip-address"] || "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}