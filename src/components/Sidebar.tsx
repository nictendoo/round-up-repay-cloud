
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  CreditCard,
  Home,
  BarChart3,
  CircleDollarSign,
  Trophy,
  Settings,
  Menu
} from "lucide-react";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const navItems = [
    { name: "Dashboard", path: "/", icon: <Home className="w-5 h-5" /> },
    { name: "Transactions", path: "/transactions", icon: <CreditCard className="w-5 h-5" /> },
    { name: "Debts", path: "/debts", icon: <CircleDollarSign className="w-5 h-5" /> },
    { name: "Analytics", path: "/analytics", icon: <BarChart3 className="w-5 h-5" /> },
    { name: "Achievements", path: "/achievements", icon: <Trophy className="w-5 h-5" /> },
    { name: "Settings", path: "/settings", icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside 
      className={`h-screen fixed top-0 left-0 bg-white border-r border-gray-200 transition-all duration-300 z-10 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between p-4">
        {!collapsed && (
          <div className="font-bold text-xl text-transparent bg-clip-text bg-primary-gradient">
            MicroRepay
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <nav className="mt-8">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 ${
                    isActive
                      ? "bg-purple-light/20 text-purple border-r-4 border-purple"
                      : "text-gray-600 hover:bg-gray-100"
                  } transition-colors ${collapsed ? "justify-center" : ""}`
                }
              >
                {item.icon}
                {!collapsed && <span className="ml-3">{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
