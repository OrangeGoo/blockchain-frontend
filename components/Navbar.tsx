"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Database, Vote, BarChart3, Settings } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { Button } from "@/components/ui/button";
import { useBlockchain } from "@/context/BlockchainContext";

export default function Navbar() {
  const pathname = usePathname();
  const { nodeStatus } = useBlockchain();

  const navItems = [
    {
      path: "/",
      label: "Dashboard",
      icon: <Database className="h-4 w-4 mr-2" />,
    },
    {
      path: "/voting",
      label: "Voting",
      icon: <Vote className="h-4 w-4 mr-2" />,
    },
    {
      path: "/explorer",
      label: "Explorer",
      icon: <BarChart3 className="h-4 w-4 mr-2" />,
    },
    {
      path: "/settings",
      label: "Settings",
      icon: <Settings className="h-4 w-4 mr-2" />,
    },
  ];

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary">
              BlockChain System
            </Link>

            <div className="ml-10 flex items-center space-x-4">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={pathname === item.path ? "default" : "ghost"}
                    className="flex items-center"
                  >
                    {item.icon}
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span
                className={`h-2 w-2 rounded-full mr-2 ${
                  nodeStatus ? "bg-green-500" : "bg-red-500"
                }`}
              ></span>
              <span className="text-sm text-muted-foreground">
                {nodeStatus ? "Connected" : "Disconnected"}
              </span>
            </div>
            <ModeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
