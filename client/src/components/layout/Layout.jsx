import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

const Layout = () => (
  <div className="min-h-screen flex flex-col bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.14),_transparent_32%),linear-gradient(135deg,_#fffef9_0%,_#fff7e6_100%)] text-ink">
    <Navbar />
    <main className="flex-1 w-full px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <Outlet />
      </div>
    </main>
    <Footer />
  </div>
);

export default Layout;
