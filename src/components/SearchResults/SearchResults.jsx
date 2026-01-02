import React from "react";
import { useLocation, Link } from "react-router-dom";
import { LayoutDashboard, Briefcase, Users, Clipboard, MessageCircleQuestion, CreditCard, FileText } from "lucide-react";

const menuItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  {
    label: "Clients",
    icon: Briefcase,
    subMenu: [
      { label: "Clients", path: "/client-table" },
      { label: "Projects", path: "/project" },
      { label: "Payments", path: "/payments-table" },
    ],
  },
  { label: "Tasks", path: "/task", icon: Clipboard },
  { label: "Enquiries", path: "/lead-table", icon: MessageCircleQuestion },
  { label: "Expenses", path: "/expense-table", icon: CreditCard },
  { label: "MoM", path: "/momdetails", icon: FileText },
  { label: "Quotations", path: "/quotation-table", icon: FileText },
];

const SearchResults = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("query")?.toLowerCase() || "";

  const filterMenuItems = (items) => {
    return items
      .map((item) => {
        if (item.subMenu) {
          const filteredSubMenu = item.subMenu.filter((sub) =>
            sub.label.toLowerCase().includes(searchQuery)
          );
          return filteredSubMenu.length ? { ...item, subMenu: filteredSubMenu } : null;
        }
        return item.label.toLowerCase().includes(searchQuery) ? item : null;
      })
      .filter(Boolean);
  };

  const filteredItems = filterMenuItems(menuItems);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Search Results for: {searchQuery}</h1>
      {filteredItems.length > 0 ? (
        <ul className="space-y-2">
          {filteredItems.map((item) => (
            <li key={item.path || item.label} className="border p-4 rounded-lg">
              <Link to={item.path || "#"} className="flex items-center space-x-2 text-blue-600 hover:underline">
                {item.icon && <item.icon className="h-5 w-5" />}
                <span>{item.label}</span>
              </Link>
              {item.subMenu && (
                <ul className="ml-6 mt-2 space-y-1">
                  {item.subMenu.map((subItem) => (
                    <li key={subItem.path}>
                      <Link to={subItem.path} className="text-gray-700 hover:underline">
                        {subItem.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No results found.</p>
      )}
    </div>
  );
};

export default SearchResults;
