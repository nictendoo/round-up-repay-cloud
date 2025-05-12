import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  CreditCard,
  Home,
  BarChart3,
  CircleDollarSign,
  Trophy,
  Settings,
  Menu,
  User,
  Building,
  LogOut
} from "lucide-react";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<{name: string; email: string} | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };
  
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <Home className="w-5 h-5" /> },
    { name: "Transactions", path: "/transactions", icon: <CreditCard className="w-5 h-5" /> },
    { name: "Debts", path: "/debts", icon: <CircleDollarSign className="w-5 h-5" /> },
    { name: "Connect Bank", path: "/connect-bank", icon: <Building className="w-5 h-5" /> },
    { name: "Profile", path: "/profile", icon: <User className="w-5 h-5" /> },
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

      {!collapsed && user && (
        <div className="px-4 py-2 border-b border-gray-200 mb-4">
          <p className="font-medium text-sm truncate">{user.name}</p>
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
        </div>
      )}

      <nav className="mt-4">
        <ul className="space-y-1">
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
      
      {/* Logout at bottom */}
      <div className="absolute bottom-8 w-full px-4">
        <button
          onClick={handleLogout}
          className={`flex items-center w-full px-4 py-3 text-gray-600 hover:bg-gray-100 transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
