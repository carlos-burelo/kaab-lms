# KAAB LMS - Scalable Architecture Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture Principles](#architecture-principles)
3. [Layer Structure](#layer-structure)
4. [Domain-Driven Design](#domain-driven-design)
5. [Core Building Blocks](#core-building-blocks)
6. [Module Structure](#module-structure)
7. [Usage Guide](#usage-guide)
8. [Migration Guide](#migration-guide)
9. [Best Practices](#best-practices)
10. [Examples](#examples)

---

## Overview

This LMS implements a **Clean Architecture** combined with **Domain-Driven Design (DDD)** principles to ensure:

- ✅ **Scalability**: Easy to add new features and modules
- ✅ **Maintainability**: Clear separation of concerns
- ✅ **Testability**: Each layer can be tested independently
- ✅ **Flexibility**: Business logic independent of frameworks
- ✅ **Type Safety**: Full TypeScript with compile-time guarantees

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                  Presentation Layer                     │
│         (Server Actions, API Routes, UI)                │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│                 Application Layer                       │
│         (Use Cases, DTOs, Validation)                   │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│                   Domain Layer                          │
│   (Entities, Value Objects, Domain Events,              │
│    Domain Services, Repository Interfaces)              │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│              Infrastructure Layer                       │
│  (Repository Implementations, External Services,        │
│   Event Bus, Database, File Storage)                    │
└─────────────────────────────────────────────────────────┘
```

---

## Architecture Principles

### 1. Dependency Inversion
- High-level modules don't depend on low-level modules
- Both depend on abstractions (interfaces)
- Dependencies point inward (toward the domain)

### 2. Single Responsibility
- Each class/module has one reason to change
- Clear separation between layers

### 3. Open/Closed
- Open for extension, closed for modification
- Use composition and dependency injection

### 4. Result Pattern
- No exceptions for business logic errors
- Type-safe error handling with `Result<T, E>`

### 5. Domain-Driven Design
- Ubiquitous language
- Bounded contexts
- Aggregate roots
- Domain events

---

## Layer Structure

### 1. Domain Layer (`src/modules/{module}/domain/`)

**Purpose**: Contains pure business logic, independent of frameworks

**Components**:
- **Entities**: Objects with identity (e.g., Course, User)
- **Aggregate Roots**: Entities that maintain consistency boundaries
- **Value Objects**: Immutable objects without identity (e.g., Email, Price)
- **Domain Events**: Things that happened in the domain
- **Repository Interfaces**: Contracts for data access
- **Domain Services**: Business logic that doesn't belong to entities

**Rules**:
- ❌ NO framework dependencies
- ❌ NO database/external service calls
- ✅ Pure TypeScript/JavaScript
- ✅ Business rules and validation

**Example**:
```typescript
// Domain Entity
export class Course extends AggregateRoot<CourseProps> {
  publish(): Result<void, BusinessRuleError> {
    if (!this.description) {
      return Result.fail(
        new BusinessRuleError('Course must have a description')
      );
    }
    this.isPublished = true;
    this.addDomainEvent(new CoursePublishedEvent({ ... }));
    return Result.ok(undefined);
  }
}
```

### 2. Application Layer (`src/modules/{module}/application/`)

**Purpose**: Orchestrates business logic, implements use cases

**Components**:
- **Use Cases**: Application-specific business rules
- **DTOs**: Data Transfer Objects for input/output
- **Application Services**: Coordinate multiple use cases

**Rules**:
- ✅ Coordinates domain objects
- ✅ Handles transactions
- ✅ Validates input
- ❌ NO business logic (that belongs in domain)

**Example**:
```typescript
export class CreateCourseUseCase extends BaseUseCase<
  CreateCourseRequest,
  CourseDTO
> {
  async execute(request: CreateCourseRequest): Promise<Result<CourseDTO>> {
    // 1. Validate
    // 2. Create domain entity
    // 3. Save via repository
    // 4. Return DTO
  }
}
```

### 3. Infrastructure Layer (`src/modules/{module}/infrastructure/`)

**Purpose**: Implements technical details and external services

**Components**:
- **Repository Implementations**: Prisma/database access
- **Mappers**: Convert between domain and persistence models
- **External Services**: File storage, email, payments
- **Event Handlers**: React to domain events

**Rules**:
- ✅ Implements domain interfaces
- ✅ Handles database, HTTP, file system
- ✅ Framework-specific code

**Example**:
```typescript
export class CourseRepository implements ICourseRepository {
  async save(entity: Course): Promise<Result<Course>> {
    const persistenceModel = this.mapper.toPersistence(entity);
    const saved = await prisma.course.upsert({ ... });
    await this.publishDomainEvents(entity);
    return Result.ok(this.mapper.toDomain(saved));
  }
}
```

### 4. Presentation Layer (`src/app/`)

**Purpose**: Handles user interaction and external requests

**Components**:
- **Server Actions**: Next.js server actions
- **API Routes**: REST/GraphQL endpoints
- **UI Components**: React components

**Rules**:
- ✅ Validates user input
- ✅ Calls use cases
- ✅ Handles authentication/authorization
- ✅ Formats responses

**Example**:
```typescript
'use server'
export async function createCourse(formData: FormData) {
  const session = await getSession();
  const useCase = getUseCase<CreateCourseUseCase>(TOKENS.CREATE_COURSE_USE_CASE);

  const result = await useCase.execute({
    dto: CreateCourseSchema.parse(data),
    currentUserId: session.user.id
  });

  return result.match(
    (course) => ({ success: true, data: course }),
    (error) => ({ success: false, error: error.message })
  );
}
```

---

## Domain-Driven Design

### Bounded Contexts

The LMS is divided into the following bounded contexts:

1. **Course** - Course management, modules, lessons
2. **User** - Users, profiles, preferences
3. **Assessment** - Quizzes, assignments, grading
4. **Enrollment** - Student enrollments, progress
5. **Gamification** - Badges, achievements, missions
6. **Learning Path** - Learning path designer and execution
7. **Payment** - Payments, subscriptions, invoices
8. **Communication** - Messages, discussions, notifications
9. **Productivity** - Tasks, calendar
10. **Infrastructure** - Files, certificates

### Aggregate Roots

Each bounded context has one or more aggregate roots:

- **Course**: `Course` → owns `Module`, `Lesson`, `LessonContent`
- **User**: `User` → owns `UserProfile`, `UserGamification`
- **Quiz**: `Quiz` → owns `Question`, `AnswerOption`
- **Enrollment**: `Enrollment` → owns `UserLessonProgress`

### Domain Events

Events are emitted when important things happen:

```typescript
// Course Domain Events
- CourseCreatedEvent
- CoursePublishedEvent
- CourseUnpublishedEvent
- CourseDeletedEvent

// Enrollment Domain Events
- StudentEnrolledEvent
- LessonCompletedEvent
- CourseCompletedEvent

// Gamification Domain Events
- BadgeAwardedEvent
- LevelUpEvent
- MissionCompletedEvent
```

---

## Core Building Blocks

### Result Pattern

Type-safe error handling without exceptions:

```typescript
// Success
const result = Result.ok(value);

// Failure
const result = Result.fail(new ValidationError('Invalid email'));

// Usage
const result = await someOperation();
if (result.isSuccess) {
  console.log(result.value);
} else {
  console.error(result.error);
}

// Pattern matching
return result.match(
  (value) => ({ success: true, data: value }),
  (error) => ({ success: false, error: error.message })
);
```

### Error Hierarchy

```typescript
AppError
├── DomainError
│   ├── ValidationError
│   ├── BusinessRuleError
│   ├── EntityNotFoundError
│   └── DuplicateEntityError
├── ApplicationError
│   ├── UnauthorizedError
│   ├── ForbiddenError
│   └── InvalidCredentialsError
└── InfrastructureError
    ├── DatabaseError
    ├── ExternalServiceError
    └── FileOperationError
```

### Entity Base Class

```typescript
export abstract class Entity<T extends EntityProps> {
  protected readonly _id: string;
  protected _props: T;

  get id(): string { return this._id; }

  equals(entity?: Entity<T>): boolean {
    return this._id === entity?._id;
  }

  abstract toObject(): T & { id: string };
}
```

### Value Objects

```typescript
export class Email extends ValueObject<{ value: string }> {
  static create(email: string): Result<Email, ValidationError> {
    if (!this.isValid(email)) {
      return Result.fail(new ValidationError('Invalid email'));
    }
    return Result.ok(new Email({ value: email }));
  }
}
```

### Dependency Injection

```typescript
// Register
container.register(TOKENS.COURSE_REPOSITORY, () => new CourseRepository());

// Resolve
const repo = container.resolve<ICourseRepository>(TOKENS.COURSE_REPOSITORY);
```

---

## Module Structure

Each module follows this structure:

```
src/modules/{module}/
├── domain/
│   ├── {entity}.entity.ts          # Aggregate root
│   ├── {entity}.repository.interface.ts
│   ├── value-objects/
│   │   ├── {value-object}.ts
│   │   └── index.ts
│   ├── events/
│   │   ├── {event}.event.ts
│   │   └── index.ts
│   └── services/                   # Domain services (optional)
│       └── {service}.service.ts
├── application/
│   ├── use-cases/
│   │   ├── {use-case}.use-case.ts
│   │   └── index.ts
│   ├── dtos/
│   │   ├── {dto}.dto.ts
│   │   └── index.ts
│   └── services/                   # Application services (optional)
│       └── {service}.service.ts
└── infrastructure/
    ├── {entity}.repository.ts      # Repository implementation
    ├── {entity}.mapper.ts          # Mapper
    └── event-handlers/             # Event handlers (optional)
        └── {handler}.handler.ts
```

---

## Usage Guide

### Creating a New Module

1. **Define the Domain**:
```typescript
// src/modules/quiz/domain/quiz.entity.ts
export class Quiz extends AggregateRoot<QuizProps> {
  // Business logic here
}
```

2. **Create Repository Interface**:
```typescript
// src/modules/quiz/domain/quiz.repository.interface.ts
export interface IQuizRepository extends Repository<Quiz> {
  findByLesson(lessonId: string): Promise<Result<Quiz | null>>;
}
```

3. **Implement Repository**:
```typescript
// src/modules/quiz/infrastructure/quiz.repository.ts
export class QuizRepository implements IQuizRepository {
  async save(entity: Quiz): Promise<Result<Quiz>> {
    // Prisma implementation
  }
}
```

4. **Create Use Case**:
```typescript
// src/modules/quiz/application/use-cases/create-quiz.use-case.ts
export class CreateQuizUseCase extends BaseUseCase<Request, Response> {
  async execute(request: Request): Promise<Result<Response>> {
    // 1. Validate
    // 2. Create domain entity
    // 3. Save
    // 4. Return DTO
  }
}
```

5. **Register in Container**:
```typescript
// src/core/infrastructure/container.config.ts
container.register(TOKENS.QUIZ_REPOSITORY, () => new QuizRepository());
container.register(TOKENS.CREATE_QUIZ_USE_CASE, () =>
  new CreateQuizUseCase(container.resolve(TOKENS.QUIZ_REPOSITORY))
);
```

6. **Use in Server Action**:
```typescript
// src/actions/quiz.actions.ts
'use server'
export async function createQuiz(data: unknown) {
  const useCase = getUseCase<CreateQuizUseCase>(TOKENS.CREATE_QUIZ_USE_CASE);
  const result = await useCase.execute({ dto: data, currentUserId });

  return result.match(
    (quiz) => ({ success: true, data: quiz }),
    (error) => ({ success: false, error: error.message })
  );
}
```

---

## Migration Guide

### Migrating Existing Code

#### Before (Old Pattern):
```typescript
// actions/course.actions.ts
export async function createCourse(data: FormData) {
  const session = await getSession();
  const validated = CreateCourseSchema.parse(data);

  const course = await courseRepository.create({
    ...validated,
    instructorId: session.user.id
  });

  revalidatePath('/instructor/cursos');
  return { success: true, data: course };
}
```

#### After (New Pattern):
```typescript
// actions/course.actions.ts
'use server'
export async function createCourse(data: FormData) {
  const session = await getSession();

  const useCase = getUseCase<CreateCourseUseCase>(
    TOKENS.CREATE_COURSE_USE_CASE
  );

  const result = await useCase.execute({
    dto: CreateCourseSchema.parse(Object.fromEntries(data)),
    currentUserId: session.user.id
  });

  revalidatePath('/instructor/cursos');

  return result.match(
    (course) => ({ success: true, data: course }),
    (error) => ({ success: false, error: error.message })
  );
}
```

### Gradual Migration Strategy

1. ✅ **Phase 1**: Core foundation (DONE)
   - Result pattern
   - Error classes
   - Base classes (Entity, ValueObject, AggregateRoot)
   - Event bus
   - DI container

2. 🔄 **Phase 2**: Migrate one module (Course)
   - Create domain entities
   - Implement repository
   - Create use cases
   - Update server actions

3. **Phase 3**: Migrate remaining modules
   - User, Quiz, Assignment, etc.
   - Follow same pattern

4. **Phase 4**: Add cross-cutting concerns
   - Logging
   - Monitoring
   - Caching
   - Rate limiting

---

## Best Practices

### 1. Keep Domain Pure
```typescript
// ❌ DON'T - Framework dependency in domain
import { prisma } from '@/lib/prisma';

export class Course {
  async save() {
    await prisma.course.create({ ... }); // NO!
  }
}

// ✅ DO - Use repository interface
export class Course {
  // No persistence logic here
  // Repository handles saving
}
```

### 2. Use Value Objects for Validation
```typescript
// ❌ DON'T - Primitive obsession
class Course {
  constructor(public email: string) {}
}

// ✅ DO - Value object
class Course {
  constructor(public email: Email) {}
}

const emailResult = Email.create(userInput);
if (emailResult.isFailure) {
  return Result.fail(emailResult.error);
}
```

### 3. Always Return Results
```typescript
// ❌ DON'T - Throw exceptions
publish(): void {
  if (!this.isValid()) {
    throw new Error('Invalid course');
  }
}

// ✅ DO - Return Result
publish(): Result<void, BusinessRuleError> {
  if (!this.isValid()) {
    return Result.fail(new BusinessRuleError('Invalid course'));
  }
  return Result.ok(undefined);
}
```

### 4. Use Domain Events
```typescript
// ✅ DO - Emit events for important actions
publish(): Result<void> {
  this.isPublished = true;
  this.addDomainEvent(new CoursePublishedEvent({ ... }));
  return Result.ok(undefined);
}

// Then handle in event handler
export class NotifyStudentsOnCoursePublished implements EventHandler<CoursePublishedEvent> {
  async handle(event: CoursePublishedEvent): Promise<void> {
    // Send notifications
  }
}
```

### 5. Keep Use Cases Focused
```typescript
// ❌ DON'T - Multiple responsibilities
class CourseUseCase {
  createAndPublish() { }
  updateAndNotify() { }
}

// ✅ DO - Single responsibility
class CreateCourseUseCase { }
class PublishCourseUseCase { }
class UpdateCourseUseCase { }
```

---

## Examples

### Complete Flow Example

```typescript
// 1. Domain Layer
export class Course extends AggregateRoot<CourseProps> {
  publish(): Result<void, BusinessRuleError> {
    if (!this.description) {
      return Result.fail(
        new BusinessRuleError('Description required')
      );
    }
    this.isPublished = true;
    this.addDomainEvent(new CoursePublishedEvent({
      courseId: this.id,
      title: this.title.value
    }));
    return Result.ok(undefined);
  }
}

// 2. Application Layer
export class PublishCourseUseCase extends BaseUseCase<Request, Response> {
  async execute(request: Request): Promise<Result<CourseDTO>> {
    const courseResult = await this.repo.findById(request.courseId);
    if (courseResult.isFailure) return Result.fail(courseResult.error);

    const course = courseResult.value;
    const publishResult = course.publish();
    if (publishResult.isFailure) return Result.fail(publishResult.error);

    const savedResult = await this.repo.save(course);
    if (savedResult.isFailure) return Result.fail(savedResult.error);

    return Result.ok(this.mapper.toDTO(savedResult.value));
  }
}

// 3. Infrastructure Layer
export class CourseRepository implements ICourseRepository {
  async save(entity: Course): Promise<Result<Course>> {
    const model = this.mapper.toPersistence(entity);
    const saved = await prisma.course.upsert({ ... });
    await this.publishDomainEvents(entity);
    return Result.ok(this.mapper.toDomain(saved));
  }
}

// 4. Presentation Layer
'use server'
export async function publishCourse(courseId: string) {
  const session = await getSession();
  const useCase = getUseCase<PublishCourseUseCase>(
    TOKENS.PUBLISH_COURSE_USE_CASE
  );

  const result = await useCase.execute({
    courseId,
    currentUserId: session.user.id
  });

  revalidatePath(`/instructor/cursos/${courseId}`);

  return result.match(
    (course) => ({ success: true, data: course }),
    (error) => ({ success: false, error: error.toJSON() })
  );
}
```

---

## Benefits

1. **Testability**: Mock repositories and test business logic in isolation
2. **Maintainability**: Clear separation makes code easy to understand
3. **Scalability**: Add new features without breaking existing code
4. **Flexibility**: Swap implementations (e.g., change database) easily
5. **Type Safety**: Compile-time guarantees throughout the stack
6. **Domain Focus**: Business rules are explicit and protected

---

## Next Steps

1. ✅ Complete Course module implementation
2. Apply same pattern to User module
3. Apply to Quiz/Assessment module
4. Apply to Gamification module
5. Add event handlers for cross-domain communication
6. Add comprehensive tests
7. Add API documentation

---

## Resources

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Result Pattern](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
