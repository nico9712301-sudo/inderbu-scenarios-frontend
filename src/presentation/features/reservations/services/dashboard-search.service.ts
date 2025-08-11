// API Services para search de filtros del dashboard
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface ScenarioOption {
  id: number;
  name: string;
}

export interface ActivityAreaOption {
  id: number;
  name: string;
}

export interface NeighborhoodOption {
  id: number;
  name: string;
}

export interface UserOption {
  id: number;
  name: string;
}

export async function searchScenarios(
  search: string = "",
): Promise<ScenarioOption[]> {
  try {
    const params = new URLSearchParams();
    if (search.trim()) {
      params.append("search", search.trim());
    }
    params.append("limit", "20");

    const url = `${API_BASE_URL}/scenarios${params.toString() ? `?${params.toString()}` : "?limit=20"}`;
    console.log("Fetching scenarios from:", url);

    const token = localStorage.getItem("auth_token");
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch scenarios: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log("Scenarios response:", responseData);

    const scenarios = responseData.data || [];

    return scenarios.map((item: any) => ({
      id: Number(item.id),
      name: item.name || "",
    }));
  } catch (error) {
    console.error("Error fetching scenarios:", error);
    return [];
  }
}

export async function searchActivityAreas(
  search: string = "",
): Promise<ActivityAreaOption[]> {
  try {
    const params = new URLSearchParams();
    if (search.trim()) {
      params.append("search", search.trim());
    }
    params.append("limit", "20");

    const url = `${API_BASE_URL}/activity-areas${params.toString() ? `?${params.toString()}` : "?limit=20"}`;
    console.log("Fetching activity areas from:", url);

    const token = localStorage.getItem("auth_token");
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch activity areas: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log("Activity areas response:", responseData);

    const activityAreas = responseData.data || [];

    return activityAreas.map((item: any) => ({
      id: Number(item.id),
      name: item.name || "",
    }));
  } catch (error) {
    console.error("Error fetching activity areas:", error);
    return [];
  }
}

export async function searchNeighborhoods(
  search: string = "",
): Promise<NeighborhoodOption[]> {
  try {
    const params = new URLSearchParams();
    if (search.trim()) {
      params.append("search", search.trim());
    }
    params.append("limit", "20");

    const url = `${API_BASE_URL}/neighborhoods${params.toString() ? `?${params.toString()}` : "?limit=20"}`;
    console.log("Fetching neighborhoods from:", url);

    const token = localStorage.getItem("auth_token");
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch neighborhoods: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log("Neighborhoods response:", responseData);

    const neighborhoods = responseData.data || [];

    return neighborhoods.map((item: any) => ({
      id: Number(item.id),
      name: item.name || "",
    }));
  } catch (error) {
    console.error("Error fetching neighborhoods:", error);
    return [];
  }
}

export async function searchUsers(search: string = ""): Promise<UserOption[]> {
  try {
    const params = new URLSearchParams();
    if (search.trim()) {
      params.append("search", search.trim());
    }
    params.append("limit", "20");

    const url = `${API_BASE_URL}/users${params.toString() ? `?${params.toString()}` : "?limit=20"}`;
    console.log("Fetching users from:", url);

    const token = localStorage.getItem("auth_token");
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log("Users response:", responseData);

    const users = responseData.data || [];

    return users.map((user: any) => ({
      id: Number(user.id),
      name: `${user.firstName || user.first_name || ""} ${user.lastName || user.last_name || ""} (${user.email || ""})`.trim(),
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}
