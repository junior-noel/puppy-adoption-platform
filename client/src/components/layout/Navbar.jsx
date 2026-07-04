import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext.jsx";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Shadow on scroll
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const dashboardPath =
    user?.role === "admin"
      ? "/dashboard/admin"
      : user?.role === "shelter"
        ? user.shelter
          ? "/dashboard/shelter"
          : "/shelter/setup"
        : "/dashboard";

  const links = [
    { to: "/browse", label: "Browse puppies" },
    { to: "/success-stories", label: "Happy tails" },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 bg-white transition-shadow ${scrolled ? "shadow-md" : "border-b border-amber-100"}`}
      >
        <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link
            to="/"
            className="font-display text-xl text-amber-700 tracking-tight flex items-center gap-1.5"
          >
            <span className="animate-paw inline-block">🐾</span>
            PawHome
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`transition-colors hover:text-amber-700 ${
                  location.pathname === l.to ? "text-amber-700" : "text-ink/70"
                }`}
              >
                {l.label}
              </Link>
            ))}

            {user ? (
              <>
                <Link
                  to={dashboardPath}
                  className="text-ink/70 hover:text-amber-700 transition-colors"
                >
                  {user.role === "shelter" && !user.shelter
                    ? "Set up shelter"
                    : "Dashboard"}
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="text-amber-700 hover:text-amber-800 font-medium transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-ink/70 hover:text-amber-700 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen((o) => !o)}
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-amber-50 transition-colors"
            aria-label="Toggle menu"
          >
            <motion.span
              animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              className="block w-5 h-0.5 bg-ink rounded-full origin-center"
            />
            <motion.span
              animate={open ? { opacity: 0 } : { opacity: 1 }}
              className="block w-5 h-0.5 bg-ink rounded-full"
            />
            <motion.span
              animate={open ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              className="block w-5 h-0.5 bg-ink rounded-full origin-center"
            />
          </button>
        </nav>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/30 z-30 md:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-72 bg-white z-40 shadow-2xl md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-amber-100">
                <span className="font-display text-xl text-amber-700">
                  🐾 PawHome
                </span>
                <button
                  onClick={() => setOpen(false)}
                  className="text-ink/50 hover:text-ink text-2xl leading-none"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-2">
                {links.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      location.pathname === l.to
                        ? "bg-amber-50 text-amber-700"
                        : "text-ink/70 hover:bg-amber-50"
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}

                {user ? (
                  <>
                    <Link
                      to={dashboardPath}
                      className="px-4 py-3 rounded-xl text-sm font-medium text-ink/70 hover:bg-amber-50 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        navigate("/");
                      }}
                      className="px-4 py-3 rounded-xl text-sm font-medium text-amber-700 hover:bg-amber-50 text-left transition-colors"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="px-4 py-3 rounded-xl text-sm font-medium text-ink/70 hover:bg-amber-50 transition-colors"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      className="px-4 py-3 rounded-xl text-sm font-medium bg-amber-600 text-white text-center hover:bg-amber-700 transition-colors mt-2"
                    >
                      Sign up — it's free
                    </Link>
                  </>
                )}
              </div>

              {/* Bottom user info */}
              {user && (
                <div className="p-5 border-t border-amber-100">
                  <p className="text-xs text-ink/40">Logged in as</p>
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-amber-600 capitalize">
                    {user.role}
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;

// import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext.jsx";

// const Navbar = () => {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   const dashboardPath =
//     user?.role === "admin"
//       ? "/dashboard/admin"
//       : user?.role === "shelter"
//         ? user.shelter
//           ? "/dashboard/shelter"
//           : "/shelter/setup"
//         : "/dashboard";

//   return (
//     <header className="border-b border-amber-100 bg-white sticky top-0 z-10">
//       <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
//         <Link
//           to="/"
//           className="font-display text-2xl text-amber-700 tracking-tight"
//         >
//           PawHome
//         </Link>

//         <div className="flex items-center gap-6 text-sm font-medium">
//           <Link
//             to="/browse"
//             className="text-ink/70 hover:text-ink transition-colors"
//           >
//             Browse puppies
//           </Link>
//           <Link
//             to="/success-stories"
//             className="text-ink/70 hover:text-ink transition-colors"
//           >
//             Happy tails
//           </Link>

//           {user ? (
//             <>
//               <Link
//                 to={dashboardPath}
//                 className="text-ink/70 hover:text-ink transition-colors"
//               >
//                 {user.role === "shelter" && !user.shelter
//                   ? "Set up shelter"
//                   : "Dashboard"}
//               </Link>
//               <button
//                 onClick={() => {
//                   logout();
//                   navigate("/");
//                 }}
//                 className="text-amber-700 hover:text-amber-800 transition-colors"
//               >
//                 Log out
//               </button>
//             </>
//           ) : (
//             <>
//               <Link
//                 to="/login"
//                 className="text-ink/70 hover:text-ink transition-colors"
//               >
//                 Log in
//               </Link>
//               <Link
//                 to="/register"
//                 className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors"
//               >
//                 Sign up
//               </Link>
//             </>
//           )}
//         </div>
//       </nav>
//     </header>
//   );
// };

// export default Navbar;

// // import { Link, useNavigate } from "react-router-dom";
// // import { useAuth } from "../../context/AuthContext.jsx";

// // const Navbar = () => {
// //   const { user, logout } = useAuth();
// //   const navigate = useNavigate();

// //   // Shelter users go to setup first if they haven't created their org profile
// //   const dashboardPath =
// //     user?.role === "admin"
// //       ? "/dashboard/admin"
// //       : user?.role === "shelter"
// //         ? user.shelter
// //           ? "/dashboard/shelter"
// //           : "/shelter/setup"
// //         : "/dashboard";

// //   return (
// //     <header className="sticky top-0 z-20 border-b border-amber-200/70 bg-white/90 backdrop-blur">
// //       <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
// //         <Link
// //           to="/"
// //           className="flex items-center gap-2 font-display text-xl font-semibold text-amber-700 sm:text-2xl"
// //         >
// //           <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-lg">
// //             🐾
// //           </span>
// //           PawHome
// //         </Link>

// //         <div className="flex items-center gap-3 text-sm font-medium sm:gap-5">
// //           <Link
// //             to="/browse"
// //             className="hidden text-ink/70 transition-colors hover:text-ink sm:block"
// //           >
// //             Browse puppies
// //           </Link>

// //           {user ? (
// //             <>
// //               <Link
// //                 to={dashboardPath}
// //                 className="text-ink/70 transition-colors hover:text-ink"
// //               >
// //                 {user.role === "shelter" && !user.shelter
// //                   ? "Set up shelter"
// //                   : "Dashboard"}
// //               </Link>
// //               <button
// //                 onClick={() => {
// //                   logout();
// //                   navigate("/");
// //                 }}
// //                 className="rounded-full border border-amber-200 px-3 py-1.5 text-amber-700 transition-colors hover:bg-amber-50"
// //               >
// //                 Log out
// //               </button>
// //             </>
// //           ) : (
// //             <>
// //               <Link
// //                 to="/login"
// //                 className="text-ink/70 transition-colors hover:text-ink"
// //               >
// //                 Log in
// //               </Link>
// //               <Link
// //                 to="/register"
// //                 className="rounded-full bg-amber-600 px-4 py-2 text-white transition-colors hover:bg-amber-700"
// //               >
// //                 Sign up
// //               </Link>
// //             </>
// //           )}
// //         </div>
// //       </nav>
// //     </header>
// //   );
// // };

// // export default Navbar;

// // // import { Link, useNavigate } from 'react-router-dom';
// // // import { useAuth } from '../../context/AuthContext.jsx';

// // // const Navbar = () => {
// // //   const { user, logout } = useAuth();
// // //   const navigate = useNavigate();

// // //   const dashboardPath =
// // //     user?.role === 'shelter' ? '/dashboard/shelter' : user?.role === 'admin' ? '/dashboard/admin' : '/dashboard';

// // //   return (
// // //     <header className="border-b border-amber-100 bg-amber-50">
// // //       <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
// // //         <Link to="/" className="font-display text-2xl text-amber-700">
// // //           PawHome
// // //         </Link>
// // //         <div className="flex items-center gap-6 text-sm font-medium">
// // //           <Link to="/browse">Browse puppies</Link>
// // //           {user ? (
// // //             <>
// // //               <Link to={dashboardPath}>Dashboard</Link>
// // //               <button
// // //                 onClick={() => {
// // //                   logout();
// // //                   navigate('/');
// // //                 }}
// // //                 className="text-amber-700"
// // //               >
// // //                 Log out
// // //               </button>
// // //             </>
// // //           ) : (
// // //             <>
// // //               <Link to="/login">Log in</Link>
// // //               <Link
// // //                 to="/register"
// // //                 className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700"
// // //               >
// // //                 Sign up
// // //               </Link>
// // //             </>
// // //           )}
// // //         </div>
// // //       </nav>
// // //     </header>
// // //   );
// // // };

// // // export default Navbar;
