import React from 'react';
import prisma from '@/lib/prisma';
import MaintenanceManager, { MaintenanceItem } from '@/components/admin/MaintenanceManager';


export default async function AdminMaintenancePage() {
  const [maintenances, allUnits] = await Promise.all([
    prisma.maintenance.findMany({
      include: {
        unit: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.productUnit.findMany({
      include: { product: true },
      orderBy: { code: 'asc' },
    }),
  ]);

  const formattedMaintenances: MaintenanceItem[] = maintenances.map((m) => ({
    id: m.id,
    unitId: m.unitId,
    unitCode: m.unit.code,
    productName: m.unit.product.name,
    issue: m.issue,
    estimatedCost: m.estimatedCost,
    startDate: m.startDate.toISOString(),
    expectedReadyDate: m.expectedReadyDate.toISOString(),
    status: m.status,
  }));

  const formattedUnits = allUnits.map((u) => ({
    id: u.id,
    code: u.code,
    productName: u.product.name,
  }));

  return (
    <div className="space-y-6">
      <MaintenanceManager
        initialMaintenances={formattedMaintenances}
        allUnits={formattedUnits}
      />
    </div>
  );
}
