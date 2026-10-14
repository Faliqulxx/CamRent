import { describe, it, expect } from 'vitest';
import { format } from 'date-fns';
import {
  isDateRangeOverlapping,
  calculateBlockedRange,
  isUnitAvailableForRange,
  calculateAvailableQuantity,
  UnitRentalRecord,
  UnitMaintenanceRecord,
} from '../availability';

describe('Availability Engine (PRD Section 7)', () => {
  // Test 1: Tumpang tindih (Overlap check)
  it('correctly detects overlapping date ranges', () => {
    // Oct 10 to Oct 12 overlaps with Oct 11 to Oct 15
    expect(
      isDateRangeOverlapping(
        new Date('2026-10-10'),
        new Date('2026-10-12'),
        new Date('2026-10-11'),
        new Date('2026-10-15')
      )
    ).toBe(true);

    // Oct 10 to Oct 12 does not overlap with Oct 14 to Oct 16
    expect(
      isDateRangeOverlapping(
        new Date('2026-10-10'),
        new Date('2026-10-12'),
        new Date('2026-10-14'),
        new Date('2026-10-16')
      )
    ).toBe(false);
  });

  // Test 2: Booking tepat setelah masa pembersihan
  it('allows booking immediately after the cleaning period ends', () => {
    // Rental: Oct 10 - Oct 12, cleaningDays: 2
    // Blocked: Oct 10 - Oct 14 (Oct 12 + 2 days = Oct 14)
    // Available starting on Oct 15!
    const { blockStart, blockEnd, availableOn } = calculateBlockedRange(
      new Date('2026-10-10'),
      new Date('2026-10-12'),
      2
    );

    expect(format(blockStart, 'yyyy-MM-dd')).toBe('2026-10-10');
    expect(format(blockEnd, 'yyyy-MM-dd')).toBe('2026-10-14');
    expect(format(availableOn, 'yyyy-MM-dd')).toBe('2026-10-15');

    const unit = { status: 'AVAILABLE' };
    const rentals: UnitRentalRecord[] = [
      {
        startDate: new Date('2026-10-10'),
        endDate: new Date('2026-10-12'),
        cleaningDays: 2,
        status: 'CONFIRMED',
      },
    ];

    // Attempting to book during cleaning period (Oct 13 - Oct 14) -> should be unavailable
    const duringCleaning = isUnitAvailableForRange(
      unit,
      rentals,
      [],
      new Date('2026-10-13'),
      new Date('2026-10-14')
    );
    expect(duringCleaning).toBe(false);

    // Attempting to book exactly the day after cleaning (Oct 15 - Oct 16) -> should be available!
    const dayAfterCleaning = isUnitAvailableForRange(
      unit,
      rentals,
      [],
      new Date('2026-10-15'),
      new Date('2026-10-16')
    );
    expect(dayAfterCleaning).toBe(true);
  });

  // Test 3: Return terlambat yang menggeser masa pembersihan
  it('blocks unit if return was late and availableAfter is pushed forward', () => {
    // Original rental ended Oct 12, but returned on Oct 14 late with 2 days cleaning -> availableAfter = Oct 16
    const unit = {
      status: 'CLEANING',
      availableAfter: new Date('2026-10-16'),
    };

    // User wants to rent starting Oct 15 -> should fail because availableAfter is Oct 16
    const attemptBeforeReady = isUnitAvailableForRange(
      unit,
      [],
      [],
      new Date('2026-10-15'),
      new Date('2026-10-17')
    );
    expect(attemptBeforeReady).toBe(false);

    // User wants to rent starting Oct 17 -> should succeed
    const attemptAfterReady = isUnitAvailableForRange(
      unit,
      [],
      [],
      new Date('2026-10-17'),
      new Date('2026-10-19')
    );
    expect(attemptAfterReady).toBe(true);
  });

  // Test 4: Maintenance di tengah periode
  it('marks unit unavailable when maintenance falls within the requested period', () => {
    const unit = { status: 'AVAILABLE' };
    const maintenances: UnitMaintenanceRecord[] = [
      {
        startDate: new Date('2026-10-18'),
        expectedReadyDate: new Date('2026-10-22'),
        status: 'IN_PROGRESS',
      },
    ];

    // Requested rental: Oct 17 - Oct 20 (overlaps with Oct 18 - Oct 22) -> should be unavailable
    const resultOverlap = isUnitAvailableForRange(
      unit,
      [],
      maintenances,
      new Date('2026-10-17'),
      new Date('2026-10-20')
    );
    expect(resultOverlap).toBe(false);

    // Requested rental: Oct 23 - Oct 25 (after maintenance) -> should be available
    const resultAfter = isUnitAvailableForRange(
      unit,
      [],
      maintenances,
      new Date('2026-10-23'),
      new Date('2026-10-25')
    );
    expect(resultAfter).toBe(true);
  });

  // Test 5: Qty melebihi stok
  it('correctly calculates available quantity when reservations exist', () => {
    const totalUnits = 5;
    const occupiedUnits = 2; // assigned to existing active rentals
    const unassignedReserved = 2; // booked but not yet assigned

    const available = calculateAvailableQuantity(totalUnits, occupiedUnits, unassignedReserved);
    expect(available).toBe(1);

    // If 4 unassigned bookings exist -> remaining is 0 (not negative)
    const overbooked = calculateAvailableQuantity(totalUnits, occupiedUnits, 4);
    expect(overbooked).toBe(0);
  });

  // Test 6: Pembatalan / expired release
  it('ignores cancelled or expired waiting payment rentals', () => {
    const unit = { status: 'AVAILABLE' };
    const now = new Date('2026-10-14T12:00:00Z');

    // Rental 1 is CANCELLED
    // Rental 2 is WAITING_PAYMENT but expired at 10:00 AM (2 hours ago)
    const rentals: UnitRentalRecord[] = [
      {
        startDate: new Date('2026-10-15'),
        endDate: new Date('2026-10-17'),
        cleaningDays: 1,
        status: 'CANCELLED',
      },
      {
        startDate: new Date('2026-10-15'),
        endDate: new Date('2026-10-17'),
        cleaningDays: 1,
        status: 'WAITING_PAYMENT',
        expiresAt: new Date('2026-10-14T10:00:00Z'), // expired!
      },
    ];

    const isAvailable = isUnitAvailableForRange(
      unit,
      rentals,
      [],
      new Date('2026-10-15'),
      new Date('2026-10-17'),
      now
    );

    // Both cancelled and expired reservations must release the unit
    expect(isAvailable).toBe(true);
  });
});
