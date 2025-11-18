/**
 * Core Shared Module
 * Exports all shared building blocks for Clean Architecture
 */

// Result Pattern
export * from './result';

// Error Classes
export * from './errors';

// Base Classes
export * from './entity';
export * from './value-object';
export * from './aggregate-root';

// Domain Events
export * from './domain-event';

// Interfaces
export * from './repository.interface';
export * from './use-case.interface';
export * from './mapper.interface';
