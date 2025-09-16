import { NavLink } from 'react-router-dom';
import { Home, Users, Info, Sparkles, ChevronDown } from 'lucide-react';
import logo from "../assets/images/instabase.png";

const Navbar = () => {
  const linkClass = ({ isActive }) =>
    isActive
      ? "relative flex items-center space-x-2 px-4 py-2 text-white bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 transition-all duration-300 hover:bg-white/20 hover:border-white/30"
      : "relative flex items-center space-x-2 px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 backdrop-blur-sm";

  const navItems = [
    { to: "/", label: "Home", icon: Home },
    { to: "/team", label: "Team", icon: Users },
    { to: "/about", label: "About", icon: Info },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-indigo-800/95 via-indigo-700/95 to-purple-800/95 backdrop-blur-lg border-b border-white/10">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center">
            <NavLink className="flex items-center space-x-3 group" to="/">
              <div className="relative">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition-all duration-300">
                  <img 
                    src={logo} 
                    alt="IBHack008 Logo" 
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-80 group-hover:scale-110 transition-transform duration-300"></div>
              </div>
              <div>
                <span className="text-2xl font-bold textbackground">
                  IBHack008
                </span>
                <div className="flex items-center space-x-1 text-xs text-white/60">
                  <Sparkles className="w-3 h-3" />
                  <span>Productivity OS</span>
                </div>
              </div>
            </NavLink>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="flex items-center space-x-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={linkClass}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="flex items-center space-x-2 px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 backdrop-blur-sm border border-white/10">
              <span className="text-sm font-medium">Menu</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Decorative bottom border */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
    </nav>
  );
};
export default Navbar;
