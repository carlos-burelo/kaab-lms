# New Architecture Implementation Guide

## Quick Start

### 1. Initialize the Application

The new architecture requires initialization when your Next.js app starts. Add this to your root layout or a server component that runs on startup:

```typescript
// src/app/layout.tsx or a component that runs early
import { bootstrapApplication } from '@/core/app-bootstrap';

// Call once when the app starts
bootstrapApplication();
```

### 2. Using the New Architecture in Server Actions

Replace your existing server actions with the new pattern:

```typescript
// src/actions/course.actions.ts
'use server'

import { getSession } from '@/lib/auth';
import { getUseCase } from '@/core/infrastructure';
import { TOKENS } from '@/core/infrastructure/dependency-injection';
import { CreateCourseUseCase } from '@/modules/course/application/use-cases';
import { CreateCourseSchema } from '@/modules/course/application/dtos';
import { revalidatePath } from 'next/cache';

export async function createCourse(formData: FormData) {
  // 1. Get authenticated user
  const session = await getSession();
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  // 2. Parse and validate input
  const data = Object.fromEntries(formData);
  const validationResult = CreateCourseSchema.safeParse(data);

  if (!validationResult.success) {
    return {
      success: false,
      error: 'Validation failed',
      errors: validationResult.error.errors
    };
  }

  // 3. Get use case from container
  const useCase = getUseCase<CreateCourseUseCase>(
    TOKENS.CREATE_COURSE_USE_CASE
  );

  // 4. Execute use case
  const result = await useCase.execute({
    dto: validationResult.data,
    currentUserId: session.user.id
  });

  // 5. Revalidate cache
  if (result.isSuccess) {
    revalidatePath('/instructor/cursos');
  }

  // 6. Return response
  return result.match(
    (course) => ({ success: true, data: course }),
    (error) => ({
      success: false,
      error: error.message,
      code: error.code
    })
  );
}
```

### 3. Creating a New Feature

Follow these steps to add a new feature using the architecture:

#### Step 1: Define Domain Entity

```typescript
// src/modules/quiz/domain/quiz.entity.ts
import { AggregateRoot, EntityProps } from '@/core/shared';
import { Result } from '@/core/shared/result';
import { BusinessRuleError } from '@/core/shared/errors';

export interface QuizProps extends EntityProps {
  title: string;
  lessonId: string;
  questions: string[]; // Question IDs
  passingScore: number;
  isPublished: boolean;
}

export class Quiz extends AggregateRoot<QuizProps> {
  // Getters
  get title(): string {
    return this._props.title;
  }

  get lessonId(): string {
    return this._props.lessonId;
  }

  get isPublished(): boolean {
    return this._props.isPublished;
  }

  // Factory method
  static create(props: Omit<QuizProps, 'id' | 'isPublished'>): Result<Quiz> {
    const quiz = new Quiz({
      ...props,
      isPublished: false
    });

    quiz.addDomainEvent(new QuizCreatedEvent({
      quizId: quiz.id,
      lessonId: props.lessonId
    }));

    return Result.ok(quiz);
  }

  // Business logic methods
  publish(): Result<void, BusinessRuleError> {
    if (this._props.questions.length === 0) {
      return Result.fail(
        new BusinessRuleError('Cannot publish quiz without questions')
      );
    }

    this._props.isPublished = true;
    this.touch();

    this.addDomainEvent(new QuizPublishedEvent({
      quizId: this.id,
      lessonId: this.lessonId
    }));

    return Result.ok(undefined);
  }

  toObject() {
    return {
      id: this.id,
      ...this._props,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  clone(): Quiz {
    return new Quiz({ ...this._props }, this._id);
  }
}
```

#### Step 2: Create Repository Interface

```typescript
// src/modules/quiz/domain/quiz.repository.interface.ts
import { Repository } from '@/core/shared';
import { Result } from '@/core/shared/result';
import { Quiz } from './quiz.entity';

export interface IQuizRepository extends Repository<Quiz> {
  findByLesson(lessonId: string): Promise<Result<Quiz | null>>;
  findPublished(lessonId: string): Promise<Result<Quiz[]>>;
}
```

#### Step 3: Implement Repository

```typescript
// src/modules/quiz/infrastructure/quiz.repository.ts
import { Result } from '@/core/shared/result';
import { DatabaseError } from '@/core/shared/errors';
import { prisma } from '@/lib/prisma';
import { Quiz } from '../domain/quiz.entity';
import { IQuizRepository } from '../domain/quiz.repository.interface';
import { quizMapper } from './quiz.mapper';
import { eventBus } from '@/core/infrastructure/event-bus';

export class QuizRepository implements IQuizRepository {
  async findById(id: string): Promise<Result<Quiz | null>> {
    try {
      const quiz = await prisma.quiz.findUnique({ where: { id } });
      if (!quiz) return Result.ok(null);

      return Result.ok(quizMapper.toDomain(quiz));
    } catch (_error)  {
      return Result.fail(
        new DatabaseError('Failed to find quiz', error as Error)
      );
    }
  }

  async save(entity: Quiz): Promise<Result<Quiz>> {
    try {
      const model = quizMapper.toPersistence(entity);

      const saved = await prisma.quiz.upsert({
        where: { id: entity.id },
        create: model,
        update: model
      });

      // Publish domain events
      for (const event of entity.domainEvents) {
        await eventBus.publish(event);
      }
      entity.clearEvents();

      return Result.ok(quizMapper.toDomain(saved));
    } catch (_error)  {
      return Result.fail(
        new DatabaseError('Failed to save quiz', error as Error)
      );
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await prisma.quiz.delete({ where: { id } });
      return Result.ok(undefined);
    } catch (_error)  {
      return Result.fail(
        new DatabaseError('Failed to delete quiz', error as Error)
      );
    }
  }

  async exists(id: string): Promise<Result<boolean>> {
    try {
      const count = await prisma.quiz.count({ where: { id } });
      return Result.ok(count > 0);
    } catch (_error)  {
      return Result.fail(
        new DatabaseError('Failed to check quiz existence', error as Error)
      );
    }
  }

  async findByLesson(lessonId: string): Promise<Result<Quiz | null>> {
    try {
      const quiz = await prisma.quiz.findUnique({ where: { lessonId } });
      if (!quiz) return Result.ok(null);

      return Result.ok(quizMapper.toDomain(quiz));
    } catch (_error)  {
      return Result.fail(
        new DatabaseError('Failed to find quiz by lesson', error as Error)
      );
    }
  }
}
```

#### Step 4: Create Use Case

```typescript
// src/modules/quiz/application/use-cases/create-quiz.use-case.ts
import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { ForbiddenError } from '@/core/shared/errors';
import { Quiz } from '../../domain/quiz.entity';
import { IQuizRepository } from '../../domain/quiz.repository.interface';

interface CreateQuizRequest {
  dto: {
    title: string;
    lessonId: string;
    passingScore: number;
  };
  currentUserId: string;
}

export class CreateQuizUseCase extends BaseUseCase<CreateQuizRequest, QuizDTO> {
  constructor(private quizRepository: IQuizRepository) {
    super();
  }

  async execute(request: CreateQuizRequest): Promise<Result<QuizDTO>> {
    const { dto, currentUserId } = request;

    // TODO: Verify user owns the lesson

    // Create quiz
    const quizResult = Quiz.create({
      title: dto.title,
      lessonId: dto.lessonId,
      passingScore: dto.passingScore,
      questions: []
    });

    if (quizResult.isFailure) {
      return Result.fail(quizResult.error);
    }

    // Save
    const savedResult = await this.quizRepository.save(quizResult.value);

    if (savedResult.isFailure) {
      return Result.fail(savedResult.error);
    }

    return Result.ok(quizMapper.toDTO(savedResult.value));
  }
}
```

#### Step 5: Register in Container

```typescript
// src/core/infrastructure/container.config.ts
import { QuizRepository } from '@/modules/quiz/infrastructure/quiz.repository';
import { CreateQuizUseCase } from '@/modules/quiz/application/use-cases';

export function configureContainer(): void {
  // ... existing registrations

  // Quiz Module
  container.register(
    TOKENS.QUIZ_REPOSITORY,
    () => new QuizRepository()
  );

  container.register(
    TOKENS.CREATE_QUIZ_USE_CASE,
    () => new CreateQuizUseCase(
      container.resolve(TOKENS.QUIZ_REPOSITORY)
    )
  );
}
```

#### Step 6: Add Token

```typescript
// src/core/infrastructure/dependency-injection.ts
export const TOKENS = {
  // ... existing tokens

  // Repositories - Quiz
  QUIZ_REPOSITORY: Symbol.for('QuizRepository'),

  // Use Cases - Quiz
  CREATE_QUIZ_USE_CASE: Symbol.for('CreateQuizUseCase'),
} as const;
```

#### Step 7: Create Server Action

```typescript
// src/actions/quiz.actions.ts
'use server'

import { getSession } from '@/lib/auth';
import { getUseCase } from '@/core/infrastructure';
import { TOKENS } from '@/core/infrastructure/dependency-injection';
import { CreateQuizUseCase } from '@/modules/quiz/application/use-cases';

export async function createQuiz(data: unknown) {
  const session = await getSession();
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  const useCase = getUseCase<CreateQuizUseCase>(
    TOKENS.CREATE_QUIZ_USE_CASE
  );

  const result = await useCase.execute({
    dto: data as any, // Add proper validation
    currentUserId: session.user.id
  });

  return result.match(
    (quiz) => ({ success: true, data: quiz }),
    (error) => ({ success: false, error: error.message })
  );
}
```

---

## Migration Checklist

When migrating existing code to the new architecture:

- [ ] Create domain entities with business logic
- [ ] Extract validation into value objects
- [ ] Create repository interface in domain layer
- [ ] Implement repository in infrastructure layer
- [ ] Create mappers for domain ↔ persistence conversion
- [ ] Create DTOs for input/output
- [ ] Create use cases for each operation
- [ ] Register everything in DI container
- [ ] Update server actions to use use cases
- [ ] Add domain events for important actions
- [ ] Create event handlers for cross-cutting concerns
- [ ] Add tests for domain logic
- [ ] Update documentation

---

## Testing Guide

### Testing Domain Logic

```typescript
// tests/modules/course/domain/course.entity.test.ts
import { Course } from '@/modules/course/domain/course.entity';
import { CourseTitle, CourseSlug, CoursePrice } from '@/modules/course/domain/value-objects';

describe('Course Entity', () => {
  it('should publish course successfully', () => {
    const course = Course.create({
      instructorId: 'instructor-1',
      title: CourseTitle.create('Test Course').value,
      slug: CourseSlug.create('test-course').value,
      description: 'Test description',
      imageId: 'image-1'
    }).value;

    const result = course.publish();

    expect(result.isSuccess).toBe(true);
    expect(course.isPublished).toBe(true);
    expect(course.domainEvents).toHaveLength(1);
  });

  it('should fail to publish without description', () => {
    const course = Course.create({
      instructorId: 'instructor-1',
      title: CourseTitle.create('Test Course').value,
      slug: CourseSlug.create('test-course').value
    }).value;

    const result = course.publish();

    expect(result.isFailure).toBe(true);
    expect(result.error.message).toContain('description');
  });
});
```

### Testing Use Cases

```typescript
// tests/modules/course/application/create-course.use-case.test.ts
import { CreateCourseUseCase } from '@/modules/course/application/use-cases';

describe('CreateCourseUseCase', () => {
  let useCase: CreateCourseUseCase;
  let mockRepository: jest.Mocked<ICourseRepository>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      slugExists: jest.fn()
    } as any;

    useCase = new CreateCourseUseCase(mockRepository);
  });

  it('should create course successfully', async () => {
    mockRepository.slugExists.mockResolvedValue(Result.ok(false));
    mockRepository.save.mockResolvedValue(Result.ok(mockCourse));

    const result = await useCase.execute({
      dto: { title: 'Test Course', instructorId: 'instructor-1' },
      currentUserId: 'instructor-1'
    });

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.save).toHaveBeenCalled();
  });
});
```

---

## Troubleshooting

### Container Not Initialized

**Error**: `Dependency not found for token`

**Solution**: Make sure you called `bootstrapApplication()` in your root layout

### Event Handlers Not Running

**Error**: Events are published but handlers don't execute

**Solution**: Register event handlers in `registerEventHandlers()` function in `app-bootstrap.ts`

### Type Errors in Mappers

**Error**: Type mismatch between domain and Prisma models

**Solution**: Ensure your mappers handle all nullable fields and type conversions properly

---

## Performance Tips

1. **Use Pagination**: Always paginate list queries
2. **Lazy Load Relations**: Only include relations you need
3. **Cache DTOs**: Cache frequently accessed DTOs
4. **Batch Events**: Publish events in batches when possible
5. **Use Transactions**: Wrap multi-step operations in transactions

---

## Support

For questions or issues with the new architecture:

1. Check `ARCHITECTURE.md` for detailed explanations
2. Review the Course module example in `src/modules/course/`
3. Look at test files for usage examples
4. Open an issue in the repository
