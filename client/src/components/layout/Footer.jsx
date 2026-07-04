import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-white border-t border-amber-100 mt-16">
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <Link
            to="/"
            className="font-display text-xl text-amber-700 flex items-center gap-1.5 mb-3"
          >
            <span>🐾</span> PawHome
          </Link>
          <p className="text-sm text-ink/60 leading-relaxed">
            Connecting loving families with puppies from verified shelters and
            rescues.
          </p>
        </div>

        {/* Adopt */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Adopt</h4>
          <ul className="space-y-2 text-sm text-ink/60">
            <li>
              <Link
                to="/browse"
                className="hover:text-amber-700 transition-colors"
              >
                Browse puppies
              </Link>
            </li>
            <li>
              <Link
                to="/success-stories"
                className="hover:text-amber-700 transition-colors"
              >
                Happy tails
              </Link>
            </li>
            <li>
              <Link
                to="/register"
                className="hover:text-amber-700 transition-colors"
              >
                Create account
              </Link>
            </li>
          </ul>
        </div>

        {/* Shelters */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Shelters</h4>
          <ul className="space-y-2 text-sm text-ink/60">
            <li>
              <Link
                to="/register"
                className="hover:text-amber-700 transition-colors"
              >
                List your puppies
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/shelter"
                className="hover:text-amber-700 transition-colors"
              >
                Shelter dashboard
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-sm font-semibold mb-3">PawHome</h4>
          <ul className="space-y-2 text-sm text-ink/60">
            <li>
              <span className="cursor-default">About us</span>
            </li>
            <li>
              <span className="cursor-default">Privacy policy</span>
            </li>
            <li>
              <span className="cursor-default">Terms of service</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-amber-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ink/40">
        <p>© {new Date().getFullYear()} PawHome. All rights reserved.</p>
        <p>Made with ❤️ for puppies everywhere</p>
      </div>
    </div>
  </footer>
);

export default Footer;

// const Footer = () => (
//   <footer className="border-t border-amber-100 mt-16 py-8 text-center text-sm text-ink/60">
//     PawHome — connecting shelters and adopters.
//   </footer>
// );

// export default Footer;
