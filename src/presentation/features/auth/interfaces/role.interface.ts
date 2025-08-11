export interface IRole {
  id: number;
  name: string;
  description?: string;
}

export interface IGetAllRolesResponse extends IRole {}
