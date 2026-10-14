import { addDays, isBefore, isAfter, startOfDay, endOfDay, max, min } from 'date-fns';
import prisma from './prisma';

export const ACTIVE_RENTAL_STATUSES = [
  'WAITING_PAYMENT',
  'CONFIRMED',
  'READY_FOR_PICKUP',
  'RENTED',
  'RETURNING',
  'OVERDUE',
];

/**
 * Checks if two date intervals [startA, endA] and [startB, endB] overlap (inclusive).
 */
export function isDateRangeOverlapping(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
): boolean {
  const sA = startOfDay(startA);
  const eA = startOfDay(endA);
  const sB = startOfDay(startB);
  const eB = startOfDay(endB);

  return sA <= eB && sB <= eA;
}

/**
 * Calculates blocked date range including post-return cleaning period.
 * Rent: [startDate, endDate]
 * Blocked: [startDate, endDate + cleaningDays]
 * Unit becomes available on endDate + cleaningDays + 1 day.
 */
export function calculateBlockedRange(
  startDate: Date,
  endDate: Date,
  cleaningDays: number = 0
): { blockStart: Date; blockEnd: Date; availableOn: Date } {
  const blockStart = startOfDay(startDate);
  const blockEnd = startOfDay(addDays(endDate, cleaningDays));
  const availableOn = startOfDay(addDays(blockEnd, 1));

  return { blockStart, blockEnd, availableOn };
}

/**
 * Pure function: determine if a single unit is available for a given date range.
 */
export interface UnitRentalRecord {
  startDate: Date;
  endDate: Date;
  cleaningDays: number;
  status: string;
  expiresAt?: Date | null;
}

export interface UnitMaintenanceRecord {
  startDate: Date;
  expectedReadyDate: Date;
  status: string;
}

export function isUnitAvailableForRange(
  unit: {
    status: string;
    availableAfter?: Date | null;
  },
  rentals: UnitRentalRecord[],
  maintenances: UnitMaintenanceRecord[],
  requestedStart: Date,
  requestedEnd: Date,
  now: Date = new Date()
): boolean {
  if (unit.status === 'INACTIVE') {
    return false;
  }

  const reqStart = startOfDay(requestedStart);
  const reqEnd = startOfDay(requestedEnd);

  // If unit is in cleaning/maintenance and has availableAfter in future
  if (unit.availableAfter && isBefore(reqStart, startOfDay(unit.availableAfter))) {
    return false;
  }

  // Check active maintenances
  for (const m of maintenances) {
    if (m.status === 'OPEN' || m.status === 'IN_PROGRESS') {
      if (isDateRangeOverlapping(reqStart, reqEnd, m.startDate, m.expectedReadyDate)) {
        return false;
      }
    }
  }

  // Check overlapping active rentals
  for (const r of rentals) {
    // If waiting payment but expired, skip
    if (r.status === 'WAITING_PAYMENT' && r.expiresAt && isAfter(now, r.expiresAt)) {
      continue;
    }

    if (!ACTIVE_RENTAL_STATUSES.includes(r.status)) {
      continue;
    }

    const { blockStart, blockEnd } = calculateBlockedRange(r.startDate, r.endDate, r.cleaningDays);
    if (isDateRangeOverlapping(reqStart, reqEnd, blockStart, blockEnd)) {
      return false;
    }
  }

  return true;
}

/**
 * Pure calculation for product available quantity.
 */
export function calculateAvailableQuantity(
  totalActiveUnitsCount: number,
  occupiedUnitIdsCount: number,
  unassignedReservedQuantity: number
): number {
  const available = totalActiveUnitsCount - occupiedUnitIdsCount - unassignedReservedQuantity;
  return Math.max(0, available);
}

/**
 * Database helper: Check availability for a specific product over a date range.
 */
export async function getProductAvailability(
  productId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  totalUnits: number;
  availableUnits: number;
  isAvailable: boolean;
}> {
  const now = new Date();
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      units: {
        where: { status: { not: 'INACTIVE' } },
        include: {
          rentalItemUnits: {
            include: {
              rentalItem: {
                include: {
                  rental: true,
                },
              },
            },
          },
          maintenances: {
            where: {
              status: { in: ['OPEN', 'IN_PROGRESS'] },
            },
          },
        },
      },
    },
  });

  if (!product || !product.isActive) {
    return { totalUnits: 0, availableUnits: 0, isAvailable: false };
  }

  const totalUnits = product.units.length;
  let occupiedAssignedUnitCount = 0;

  for (const unit of product.units) {
    const rentals: UnitRentalRecord[] = unit.rentalItemUnits.map((riu) => ({
      startDate: riu.rentalItem.rental.startDate,
      endDate: riu.rentalItem.rental.endDate,
      cleaningDays: product.cleaningDays,
      status: riu.rentalItem.rental.status,
      expiresAt: riu.rentalItem.rental.expiresAt,
    }));

    const maintenances: UnitMaintenanceRecord[] = unit.maintenances.map((m) => ({
      startDate: m.startDate,
      expectedReadyDate: m.expectedReadyDate,
      status: m.status,
    }));

    const isAvailable = isUnitAvailableForRange(
      unit,
      rentals,
      maintenances,
      startDate,
      endDate,
      now
    );

    if (!isAvailable) {
      occupiedAssignedUnitCount++;
    }
  }

  // Count unassigned active bookings for this product on overlapping dates
  const overlappingRentalItems = await prisma.rentalItem.findMany({
    where: {
      productId,
      rental: {
        status: { in: ACTIVE_RENTAL_STATUSES },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } },
        ],
      },
    },
    include: {
      rental: true,
      assignedUnits: true,
    },
  });

  let unassignedReservedQuantity = 0;
  for (const item of overlappingRentalItems) {
    const { blockStart, blockEnd } = calculateBlockedRange(
      item.rental.startDate,
      item.rental.endDate,
      product.cleaningDays
    );

    if (isDateRangeOverlapping(startDate, endDate, blockStart, blockEnd)) {
      // If units are already assigned to this item, they were already accounted for in occupiedAssignedUnitCount
      const assignedCount = item.assignedUnits.length;
      const unassignedForThisItem = Math.max(0, item.quantity - assignedCount);
      unassignedReservedQuantity += unassignedForThisItem;
    }
  }

  const availableUnits = calculateAvailableQuantity(
    totalUnits,
    occupiedAssignedUnitCount,
    unassignedReservedQuantity
  );

  return {
    totalUnits,
    availableUnits,
    isAvailable: availableUnits > 0,
  };
}

/**
 * Database helper: Get availability for multiple products at once.
 */
export async function getBulkProductsAvailability(
  productIds: string[],
  startDate: Date,
  endDate: Date
): Promise<Record<string, { totalUnits: number; availableUnits: number; isAvailable: boolean }>> {
  const result: Record<string, { totalUnits: number; availableUnits: number; isAvailable: boolean }> = {};
  for (const id of productIds) {
    result[id] = await getProductAvailability(id, startDate, endDate);
  }
  return result;
}
