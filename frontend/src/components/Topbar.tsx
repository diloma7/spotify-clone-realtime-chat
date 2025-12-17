import { SignedOut, UserButton } from "@clerk/clerk-react";
import { LayoutDashboardIcon } from "lucide-react";
import { Link } from "react-router-dom";
import SignInOAuthButtons from "./SignInOAuthButtons";
import { useAuthStore } from "@/stores/useAuthStore";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";

const Topbar = () => {
  const { isAdmin } = useAuthStore(); // Replace with actual admin check logic
  return (
    <div className="flex items-center justify-between p-4 sticky top-0 bg-zinc-900/75 z-10 backdrop-blur-md ">
      <div className="flex gap-2 items-center">
        <img
          src="/logo-2.png"
          className="size-16 rounded-full"
          alt="spotify logo"
        />
        AfriSpot Bluzz
      </div>
      <div className="flex gap-4 items-center">
        {isAdmin && (
          <Link
            to={"/admin"}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            <LayoutDashboardIcon className="siz-4 mr-2" />
            Admin Dashboard
          </Link>
        )}

        {/* <SignedIn>
          <SignOutButton />
        </SignedIn> */}

        <SignedOut>
          <SignInOAuthButtons />
        </SignedOut>

        <UserButton />
      </div>
    </div>
  );
};

export default Topbar;
