/**
 * Mapper Interface
 * Maps between different representations of data
 */

import { Entity, EntityProps } from './entity';

export interface Mapper<
  DomainEntity extends Entity<EntityProps>,
  PersistenceModel,
  DTO = unknown
> {
  /**
   * Maps from persistence model to domain entity
   */
  toDomain(raw: PersistenceModel): DomainEntity;

  /**
   * Maps from domain entity to persistence model
   */
  toPersistence(entity: DomainEntity): PersistenceModel;

  /**
   * Maps from domain entity to DTO (Data Transfer Object)
   */
  toDTO?(entity: DomainEntity): DTO;

  /**
   * Maps from DTO to domain entity
   */
  fromDTO?(dto: DTO): DomainEntity;
}
