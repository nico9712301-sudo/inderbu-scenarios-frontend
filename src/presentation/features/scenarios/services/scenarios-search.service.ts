// API Services para search de filtros de escenarios
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface NeighborhoodOption {
  id: number;
  name: string;
}

export async function searchNeighborhoodsForScenarios(
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
