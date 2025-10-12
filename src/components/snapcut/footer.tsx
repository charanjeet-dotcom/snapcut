import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full py-6">
      <div className="container mx-auto px-4 md:px-8 text-center text-sm text-muted-foreground">
        <p className="flex items-center justify-center gap-1.5">
          Made with <Heart className="h-4 w-4 text-destructive fill-destructive" /> by the Firebase team.
        </p>
      </div>
    </footer>
  );
}
