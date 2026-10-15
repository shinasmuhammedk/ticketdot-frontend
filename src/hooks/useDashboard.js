import { useEffect, useState } from "react";
import { getDashboardStats } from "../api/operator";

export const useDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {

  }, []);

  return {
    stats,
  };
};