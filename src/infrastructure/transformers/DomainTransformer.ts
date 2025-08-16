export interface IDomainTransformer<TBackend, TDomain> {
  toDomain(backendData: TBackend | Partial<TBackend>): TDomain;
  toDomain(backendData: (TBackend | Partial<TBackend>)[]): TDomain[];
  toDomain(backendData: TBackend | Partial<TBackend> | (TBackend | Partial<TBackend>)[]): TDomain | TDomain[];

  toBackend(domainEntity: TDomain | Partial<TDomain>): TBackend | Partial<TBackend>;
  toBackend(domainEntities: TDomain[]): (TBackend | Partial<TBackend>)[]; // Updated to allow mixed array
  toBackend(domainData: TDomain | Partial<TDomain> | TDomain[]): TBackend | Partial<TBackend> | (TBackend | Partial<TBackend>)[]; // Updated
}

export abstract class BaseDomainTransformer<TBackend, TDomain> implements IDomainTransformer<TBackend, TDomain> {
  toDomain(backendData: TBackend | Partial<TBackend>): TDomain;
  toDomain(backendData: (TBackend | Partial<TBackend>)[]): TDomain[];
  toDomain(backendData: TBackend | Partial<TBackend> | (TBackend | Partial<TBackend>)[]): TDomain | TDomain[] {
    if (Array.isArray(backendData)) {
      return backendData.map(data => this.transformToDomain(data));
    } else {
      return this.transformToDomain(backendData);
    }
  }

  toBackend(domainEntity: TDomain | Partial<TDomain>): TBackend | Partial<TBackend>;
  toBackend(domainEntities: TDomain[]): (TBackend | Partial<TBackend>)[]; // Updated
  toBackend(domainData: TDomain | Partial<TDomain> | TDomain[]): TBackend | Partial<TBackend> | (TBackend | Partial<TBackend>)[] {
    if (Array.isArray(domainData)) {
      return domainData.map(entity => this.transformToBackend(entity));
    } else {
      return this.transformToBackend(domainData);
    }
  }

  protected abstract transformToDomain(backendData: TBackend | Partial<TBackend>): TDomain;
  protected abstract transformToBackend(domainEntity: TDomain | Partial<TDomain>): TBackend | Partial<TBackend>;
  protected abstract validateBackendData(data: any): data is TBackend;
  protected abstract validateDomainEntity(data: any): data is TDomain | Partial<TDomain>;
}

// Factory function for creating transformers
export function createDomainTransformer<TBackend, TDomain>(
  toDomainFn: (data: TBackend | Partial<TBackend>) => TDomain,
  toBackendFn: (entity: TDomain | Partial<TDomain>) => TBackend | Partial<TBackend>,
  validateBackend: (data: any) => data is TBackend,
  validateDomain: (data: any) => data is TDomain | Partial<TDomain>
): IDomainTransformer<TBackend, TDomain> {
  return new (class extends BaseDomainTransformer<TBackend, TDomain> {
    protected transformToDomain(backendData: TBackend | Partial<TBackend>): TDomain {
      if (!this.validateBackendData(backendData)) {
        throw new Error(`Invalid backend data: ${JSON.stringify(backendData)}`);
      }
      return toDomainFn(backendData);
    }

    protected transformToBackend(domainEntity: TDomain | Partial<TDomain>): TBackend | Partial<TBackend> {
      if (!this.validateDomainEntity(domainEntity)) {
        throw new Error(`Invalid domain entity: ${JSON.stringify(domainEntity)}`);
      }
      return toBackendFn(domainEntity);
    }

    protected validateBackendData(data: any): data is TBackend {
      return validateBackend(data);
    }

    protected validateDomainEntity(data: any): data is TDomain | Partial<TDomain> {
      return validateDomain(data);
    }
  })();
}