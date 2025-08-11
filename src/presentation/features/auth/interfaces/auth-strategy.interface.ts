export interface IAuthStrategy<TData> {
  execute(data: TData): Promise<void>;
  getSuccessMessage(): string;
  getErrorMessage(error: any): string;
}
