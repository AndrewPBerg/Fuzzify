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
import { useEffect, useState } from "react";

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

export default function DomainsPage() {
  const [data, setData] = useState<DomainData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/sample-table.JSON");
      const jsonData: DomainData = await response.json();
      setData(jsonData);
    };

    fetchData();
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

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
                {info["registration-date"] !== null ? info["registration-date"] : "-"}
              </TableCell>
              <TableCell>
                {info["ip-address"] !== null ? info["ip-address"] : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}