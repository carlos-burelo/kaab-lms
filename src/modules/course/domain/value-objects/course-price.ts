/**
 * Course Price Value Object
 */

import { ValueObject } from '@/core/shared/value-object';
import { ValidationError } from '@/core/shared/errors';
import { Result } from '@/core/shared/result';

interface CoursePriceProps {
  amount: number;
  currency: string;
}

export class CoursePrice extends ValueObject<CoursePriceProps> {
  private static readonly MIN_PRICE = 0;
  private static readonly MAX_PRICE = 999999.99;
  private static readonly ALLOWED_CURRENCIES = ['MXN', 'USD', 'EUR'];

  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  get isFree(): boolean {
    return this.props.amount === 0;
  }

  private constructor(props: CoursePriceProps) {
    super(props);
  }

  static create(
    amount: number,
    currency: string = 'MXN'
  ): Result<CoursePrice, ValidationError> {
    // Validate amount
    if (amount < this.MIN_PRICE) {
      return Result.fail(
        new ValidationError(
          `Price cannot be negative`,
          'price',
          { min: String(this.MIN_PRICE) }
        )
      );
    }

    if (amount > this.MAX_PRICE) {
      return Result.fail(
        new ValidationError(
          `Price cannot exceed ${this.MAX_PRICE}`,
          'price',
          { max: String(this.MAX_PRICE) }
        )
      );
    }

    // Validate currency
    if (!this.ALLOWED_CURRENCIES.includes(currency)) {
      return Result.fail(
        new ValidationError(
          `Invalid currency. Allowed: ${this.ALLOWED_CURRENCIES.join(', ')}`,
          'currency',
          { allowedCurrencies: this.ALLOWED_CURRENCIES.join(', ') }
        )
      );
    }

    // Round to 2 decimal places
    const roundedAmount = Math.round(amount * 100) / 100;

    return Result.ok(
      new CoursePrice({ amount: roundedAmount, currency })
    );
  }

  static free(): CoursePrice {
    return new CoursePrice({ amount: 0, currency: 'MXN' });
  }

  /**
   * Apply discount percentage
   */
  applyDiscount(percentage: number): Result<CoursePrice, ValidationError> {
    if (percentage < 0 || percentage > 100) {
      return Result.fail(
        new ValidationError(
          'Discount percentage must be between 0 and 100',
          'discountPercentage'
        )
      );
    }

    const discountedAmount =
      this.props.amount * (1 - percentage / 100);
    return CoursePrice.create(discountedAmount, this.props.currency);
  }

  /**
   * Format price for display
   */
  format(): string {
    if (this.isFree) {
      return 'Free';
    }

    const formatter = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: this.props.currency,
    });

    return formatter.format(this.props.amount);
  }
}
