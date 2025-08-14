// Generic Domain Transformer
// Handles bidirectional transformation between backend data and domain entities

export interface IDomainTransformer<TBackend, TDomain> {
  toDomain(backendData: TBackend): TDomain;
  toDomain(backendData: TBackend[]): TDomain[];
  toDomain(backendData: TBackend | TBackend[]): TDomain | TDomain[];
  
  toBackend(domainEntity: TDomain): TBackend;
  toBackend(domainEntities: TDomain[]): TBackend[];
  toBackend(domainData: TDomain | TDomain[]): TBackend | TBackend[];
}

export abstract class BaseDomainTransformer<TBackend, TDomain> implements IDomainTransformer<TBackend, TDomain> {
  
  // Transform backend data to domain entities
  toDomain(backendData: TBackend): TDomain;
  toDomain(backendData: TBackend[]): TDomain[];
  toDomain(backendData: TBackend | TBackend[]): TDomain | TDomain[] {
    if (Array.isArray(backendData)) {
      return backendData.map(data => this.transformToDomain(data));
    } else {
      return this.transformToDomain(backendData);
    }
  }

  // Transform domain entities to backend data
  toBackend(domainEntity: TDomain): TBackend;
  toBackend(domainEntities: TDomain[]): TBackend[];
  toBackend(domainData: TDomain | TDomain[]): TBackend | TBackend[] {
    if (Array.isArray(domainData)) {
      return domainData.map(entity => this.transformToBackend(entity));
    } else {
      return this.transformToBackend(domainData);
    }
  }

  // Abstract methods that concrete transformers must implement
  protected abstract transformToDomain(backendData: TBackend): TDomain;
  protected abstract transformToBackend(domainEntity: TDomain): TBackend;
  protected abstract validateBackendData(data: any): data is TBackend;
  protected abstract validateDomainEntity(entity: any): entity is TDomain;
}

// Factory function for creating transformers
export function createDomainTransformer<TBackend, TDomain>(
  toDomainFn: (data: TBackend) => TDomain,
  toBackendFn: (entity: TDomain) => TBackend,
  validateBackend: (data: any) => data is TBackend,
  validateDomain: (entity: any) => entity is TDomain
): IDomainTransformer<TBackend, TDomain> {
  return new (class extends BaseDomainTransformer<TBackend, TDomain> {
    protected transformToDomain(backendData: TBackend): TDomain {
      if (!this.validateBackendData(backendData)) {
        throw new Error(`Invalid backend data: ${JSON.stringify(backendData)}`);
      }
      return toDomainFn(backendData);
    }

    protected transformToBackend(domainEntity: TDomain): TBackend {
      if (!this.validateDomainEntity(domainEntity)) {
        throw new Error(`Invalid domain entity: ${JSON.stringify(domainEntity)}`);
      }
      return toBackendFn(domainEntity);
    }

    protected validateBackendData(data: any): data is TBackend {
      return validateBackend(data);
    }

    protected validateDomainEntity(entity: any): entity is TDomain {
      return validateDomain(entity);
    }
  })();
}