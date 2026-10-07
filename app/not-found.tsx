import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button, EmptyState } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="container-narrow section-y">
      <EmptyState
        icon={<FileQuestion className="h-6 w-6" aria-hidden="true" />}
        title="Page not found"
        description="This route doesn't exist. Pick a destination — every portal is one tap away."
        action={
          <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
            <Link href="/">
              <Button className="w-full">Return Home</Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" className="w-full">
                Demo Hub
              </Button>
            </Link>
            <Link href="/customer">
              <Button variant="outline" className="w-full">
                Customer Portal
              </Button>
            </Link>
            <Link href="/merchant">
              <Button variant="outline" className="w-full">
                Merchant Portal
              </Button>
            </Link>
          </div>
        }
      />
    </div>
  );
}
