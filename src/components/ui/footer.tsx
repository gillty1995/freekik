import * as React from "react";
import { ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full px-4 py-3 flex items-center justify-between text-xs bg-transparent fixed bottom-0 left-0 z-40">
      <span className="text-muted-foreground">
        &copy; {new Date().getFullYear()} freekik
      </span>
      <a
        href="https://gillhermelin.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center text-muted-foreground hover:text-primary transition"
        aria-label="Gill Hermelin Portfolio"
      >
        <ExternalLink size={16} />
      </a>
    </footer>
  );
}
