export interface INeighborhood {
  id: number;
  name: string;
  commune: {
    id: number;
    name: string;
    city: {
      id: number;
      name: string;
    };
  };
}

export interface IGetAllNeighborhoodsResponse extends INeighborhood {}
