export interface IFormHandler<TData> {
  onSubmit: (data: TData) => Promise<void>;
  isLoading: boolean;
}
