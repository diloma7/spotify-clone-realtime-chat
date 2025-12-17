import { UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/">
          <img
            src="/logo-2.png"
            alt=""
            className="w-20 h-20 text-black rounded-full"
          />
        </Link>
        <div className="">
          <h1 className="text-3xl font-bold">Music Manager</h1>
          <p className="text-zinc-400 mt-1">Manage your Music Catalog</p>
        </div>
      </div>
      <UserButton />
    </div>
  );
};

export default Header;
