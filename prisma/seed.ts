import { PrismaClient } from '@prisma/client';
import { addDays, subDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CampRent database...');

  // Clean existing data in reverse dependency order
  await prisma.fee.deleteMany();
  await prisma.checklist.deleteMany();
  await prisma.collateral.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.rentalItemUnit.deleteMany();
  await prisma.rentalItem.deleteMany();
  await prisma.rental.deleteMany();
  await prisma.maintenance.deleteMany();
  await prisma.productUnit.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.setting.deleteMany();

  // 1. Settings
  await prisma.setting.createMany({
    data: [
      { key: 'store_name', value: 'CampRent Adventure Rental Bandung' },
      { key: 'whatsapp_number', value: '6281234567890' },
      { key: 'late_fee_per_day', value: '50000' },
      { key: 'cleaning_fee_default', value: '25000' },
      { key: 'bank_name', value: 'BCA' },
      { key: 'bank_account', value: '8735123456' },
      { key: 'bank_holder', value: 'CampRent Outdoor Indonesia' },
      { key: 'store_address', value: 'Jl. Riau No. 45, Bandung, Jawa Barat' },
    ],
  });

  // 2. Profiles (Owner, Staff, Customer)
  const owner = await prisma.profile.create({
    data: {
      id: 'usr_owner_01',
      email: 'owner@camprent.com',
      name: 'Budi Setiawan',
      role: 'OWNER',
    },
  });

  const staff = await prisma.profile.create({
    data: {
      id: 'usr_staff_01',
      email: 'staff@camprent.com',
      name: 'Rian Saputra',
      role: 'STAFF',
    },
  });

  const customerProfile1 = await prisma.profile.create({
    data: {
      id: 'usr_cust_01',
      email: 'customer@camprent.com',
      name: 'Dimas Pratama',
      role: 'CUSTOMER',
    },
  });

  const customerProfile2 = await prisma.profile.create({
    data: {
      id: 'usr_cust_02',
      email: 'anisa.lestari@gmail.com',
      name: 'Anisa Lestari',
      role: 'CUSTOMER',
    },
  });

  const customerProfile3 = await prisma.profile.create({
    data: {
      id: 'usr_cust_03',
      email: 'fajar.ramadhan@yahoo.com',
      name: 'Fajar Ramadhan',
      role: 'CUSTOMER',
    },
  });

  // Customer details
  const cust1 = await prisma.customer.create({
    data: {
      id: 'cust_01',
      profileId: customerProfile1.id,
      phone: '081298765432',
      address: 'Jl. Melati No. 15, Sukajadi, Bandung',
    },
  });

  const cust2 = await prisma.customer.create({
    data: {
      id: 'cust_02',
      profileId: customerProfile2.id,
      phone: '081377889900',
      address: 'Jl. Dago Asri No. 8B, Coblong, Bandung',
    },
  });

  const cust3 = await prisma.customer.create({
    data: {
      id: 'cust_03',
      profileId: customerProfile3.id,
      phone: '082155443322',
      address: 'Komplek Antapani Indah Blok C3, Bandung',
    },
  });

  // 3. Categories (7 categories)
  const catTenda = await prisma.category.create({
    data: { name: 'Tenda', slug: 'tenda', icon: 'Tent' },
  });
  const catSleepingBag = await prisma.category.create({
    data: { name: 'Sleeping Bag', slug: 'sleeping-bag', icon: 'BedDouble' },
  });
  const catMatras = await prisma.category.create({
    data: { name: 'Matras', slug: 'matras', icon: 'Layers' },
  });
  const catFurniture = await prisma.category.create({
    data: { name: 'Furniture', slug: 'furniture', icon: 'Armchair' },
  });
  const catCooking = await prisma.category.create({
    data: { name: 'Cooking', slug: 'cooking', icon: 'Flame' },
  });
  const catLighting = await prisma.category.create({
    data: { name: 'Lighting', slug: 'lighting', icon: 'Flashlight' },
  });
  const catCarrier = await prisma.category.create({
    data: { name: 'Carrier', slug: 'carrier', icon: 'Backpack' },
  });

  // 4. Products (15 realistic products)
  const productsData = [
    {
      categoryId: catTenda.id,
      name: 'Tenda Consina Magnum 4P',
      slug: 'tenda-consina-magnum-4p',
      description: 'Tenda dome double layer berkapasitas 4 orang dengan vestibule luas untuk perlengkapan luar. Tahan air dengan waterproof PU 3000mm.',
      capacity: 4,
      dimension: '210 x 240 x 135 cm',
      weightKg: 3.8,
      pricePerDay: 75000,
      cleaningDays: 2,
      includedItems: JSON.stringify(['Flysheet PU 3000mm', 'Inner Breathable', 'Frame Fiber 3 Set', 'Pasak Logam 14 pcs', 'Tali Guyline', 'Tas Tenda']),
      ratingAvg: 4.9,
      ratingCount: 38,
      images: [
        'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800&auto=format&fit=crop&q=80',
      ],
      unitPrefix: 'TND-M4',
      unitCount: 8,
    },
    {
      categoryId: catTenda.id,
      name: 'Tenda Eiger Guardian 6P',
      slug: 'tenda-eiger-guardian-6p',
      description: 'Tenda keluarga kapasitas 6 orang yang kokoh dan lapang dengan 2 kamar tidur terpisah serta ruang tengah.',
      capacity: 6,
      dimension: '300 x 300 x 185 cm',
      weightKg: 6.5,
      pricePerDay: 120000,
      cleaningDays: 2,
      includedItems: JSON.stringify(['Outer Tent 3000mm', 'Inner Tent', 'Frame Alloy 4 Set', 'Pasak Baja 20 pcs', 'Carry Bag']),
      ratingAvg: 4.8,
      ratingCount: 24,
      images: [
        'https://images.unsplash.com/photo-1478860409698-8707f313ee8b?w=800&auto=format&fit=crop&q=80',
      ],
      unitPrefix: 'TND-E6',
      unitCount: 6,
    },
    {
      categoryId: catTenda.id,
      name: 'Tenda Naturehike Cloud Up 2P',
      slug: 'tenda-naturehike-cloud-up-2p',
      description: 'Tenda ultralight 2 orang favorit para pendaki cepat. Sangat ringan namun kokoh di cuaca gunung tropis.',
      capacity: 2,
      dimension: '210 x 125 x 100 cm',
      weightKg: 1.8,
      pricePerDay: 60000,
      cleaningDays: 2,
      includedItems: JSON.stringify(['Flysheet 20D Nylon', 'Inner Tent B3 Mesh', 'Pole Aluminum 7001', 'Pegs Aluminum 11 pcs', 'Footprint']),
      ratingAvg: 4.9,
      ratingCount: 45,
      images: [
        'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800&auto=format&fit=crop&q=80',
      ],
      unitPrefix: 'TND-NH2',
      unitCount: 8,
    },
    {
      categoryId: catTenda.id,
      name: 'Tenda Dome Great Outdoor 8P Jumbo',
      slug: 'tenda-great-outdoor-8p',
      description: 'Tenda besar untuk rombongan hingga 8 orang. Plafon tinggi memudahkan mobilitas di dalam tenda.',
      capacity: 8,
      dimension: '380 x 320 x 200 cm',
      weightKg: 8.2,
      pricePerDay: 160000,
      cleaningDays: 2,
      includedItems: JSON.stringify(['Flysheet Luar', 'Inner Kamar', 'Pole Fiber Tebal', 'Pasak Jumbo', 'Tas Roda']),
      ratingAvg: 4.7,
      ratingCount: 19,
      images: [
        'https://images.unsplash.com/photo-1517824806704-9040b037703b?w=800&auto=format&fit=crop&q=80',
      ],
      unitPrefix: 'TND-GO8',
      unitCount: 4,
    },
    {
      categoryId: catSleepingBag.id,
      name: 'Sleeping Bag Consina Snug 15C',
      slug: 'sleeping-bag-consina-snug',
      description: 'Sleeping bag tipe mummy dengan lapisan bulu polar halus. Nyaman untuk suhu 10°C - 15°C di perkemahan dataran tinggi.',
      capacity: 1,
      dimension: '205 x 75 cm',
      weightKg: 0.95,
      pricePerDay: 25000,
      cleaningDays: 1,
      includedItems: JSON.stringify(['Sleeping Bag Mummy', 'Compression Sack']),
      ratingAvg: 4.8,
      ratingCount: 52,
      images: [
        'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
      ],
      unitPrefix: 'SB-CSN',
      unitCount: 12,
    },
    {
      categoryId: catSleepingBag.id,
      name: 'Sleeping Bag Deuter Orbit 0C',
      slug: 'sleeping-bag-deuter-orbit',
      description: 'Sleeping bag hangat kelas ekspedisi dengan batas nyaman 0°C untuk puncak gunung Rinjani atau Semeru.',
      capacity: 1,
      dimension: '210 x 80 cm',
      weightKg: 1.4,
      pricePerDay: 35000,
      cleaningDays: 1,
      includedItems: JSON.stringify(['Sleeping Bag Ekspedisi', 'Dry Sack']),
      ratingAvg: 5.0,
      ratingCount: 31,
      images: [
        'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800&auto=format&fit=crop&q=80',
      ],
      unitPrefix: 'SB-DTR',
      unitCount: 8,
    },
    {
      categoryId: catMatras.id,
      name: 'Matras Foil Alumunium Eiger',
      slug: 'matras-foil-eiger',
      description: 'Matras lapis perak penahan dingin tanah, tahan air dan mudah digulung atau dilipat di ransel.',
      capacity: 1,
      dimension: '190 x 60 cm',
      weightKg: 0.25,
      pricePerDay: 15000,
      cleaningDays: 1,
      includedItems: JSON.stringify(['Matras Foil', 'Karet Pengikat']),
      ratingAvg: 4.7,
      ratingCount: 60,
      images: [
        'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=80',
      ],
      unitPrefix: 'MTR-FL',
      unitCount: 15,
    },
    {
      categoryId: catMatras.id,
      name: 'Matras Angin Naturehike Self-Inflating',
      slug: 'matras-angin-naturehike',
      description: 'Matras tiup otomatis tebal 5cm, sangat empuk untuk tidur nyenyak seperti di kasur hotel di alam terbuka.',
      capacity: 1,
      dimension: '195 x 65 x 5 cm',
      weightKg: 1.1,
      pricePerDay: 30000,
      cleaningDays: 1,
      includedItems: JSON.stringify(['Matras Angin', 'Katup Otomatis', 'Pouch Penyimpanan']),
      ratingAvg: 4.9,
      ratingCount: 28,
      images: [
        'https://images.unsplash.com/photo-1587574293340-e0011c4e8ecf?w=800&auto=format&fit=crop&q=80',
      ],
      unitPrefix: 'MTR-NH',
      unitCount: 8,
    },
    {
      categoryId: catCooking.id,
      name: 'Kompor Portable Kovar Windproof',
      slug: 'kompor-portable-kovar',
      description: 'Kompor gas mini dengan pelindung angin kelopak mawar. Api tetap stabil meski diterpa angin kencang.',
      capacity: 4,
      dimension: '15 x 15 x 12 cm',
      weightKg: 0.45,
      pricePerDay: 30000,
      cleaningDays: 1,
      includedItems: JSON.stringify(['Kompor Windproof', 'Tas Pouch']),
      ratingAvg: 4.8,
      ratingCount: 70,
      images: [
        'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=800&auto=format&fit=crop&q=80',
      ],
      unitPrefix: 'CK-KVR',
      unitCount: 10,
    },
    {
      categoryId: catCooking.id,
      name: 'Cookset Nesting DS-308 Camping (3 Panci + Wajan)',
      slug: 'cookset-nesting-ds308',
      description: 'Set perlengkapan masak lengkap anti-lengket anodized aluminum untuk memasak makanan 3-5 orang.',
      capacity: 4,
      dimension: '18 x 18 x 14 cm',
      weightKg: 0.85,
      pricePerDay: 25000,
      cleaningDays: 1,
      includedItems: JSON.stringify(['Panci Besar', 'Panci Sedang', 'Wajan Frypan', 'Teko Air Mini', '3 Mangkok Plastik', 'Sendok Kayu', 'Spons Cuci']),
      ratingAvg: 4.9,
      ratingCount: 44,
      images: [
        'https://images.unsplash.com/photo-1525811902-f2342640856e?w=800&auto=format&fit=crop&q=80',
      ],
      unitPrefix: 'CK-DS3',
      unitCount: 8,
    },
    {
      categoryId: catLighting.id,
      name: 'Headlamp Petzl Tikka 350 Lumens',
      slug: 'headlamp-petzl-tikka',
      description: 'Lampu kepala handal dengan sorotan cahaya lebar hingga 350 lumens. Memiliki mode lampu merah untuk malam hari.',
      capacity: 1,
      dimension: '8 x 5 x 4 cm',
      weightKg: 0.1,
      pricePerDay: 20000,
      cleaningDays: 0,
      includedItems: JSON.stringify(['Headlamp Petzl', 'Baterai AAA 3 Pcs', 'Strap Kepala Elastis']),
      ratingAvg: 4.9,
      ratingCount: 65,
      images: [
        'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=800&auto=format&fit=crop&q=80',
      ],
      unitPrefix: 'LT-PZL',
      unitCount: 12,
    },
    {
      categoryId: catLighting.id,
      name: 'Lentera Tenda LED Solar Powerbank',
      slug: 'lentera-tenda-led-solar',
      description: 'Lampu gantung tenda hemat daya dengan panel surya dan output USB yang dapat digunakan sebagai powerbank darurat.',
      capacity: 1,
      dimension: '14 x 9 cm',
      weightKg: 0.3,
      pricePerDay: 15000,
      cleaningDays: 0,
      includedItems: JSON.stringify(['Lentera LED', 'Kabel Cas USB', 'Gantungan Carabiner']),
      ratingAvg: 4.7,
      ratingCount: 39,
      images: [
        'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800&auto=format&fit=crop&q=80',
      ],
      unitPrefix: 'LT-SOL',
      unitCount: 10,
    },
    {
      categoryId: catCarrier.id,
      name: 'Carrier Deuter Futura Pro 50L',
      slug: 'carrier-deuter-futura-50l',
      description: 'Tas ransel gunung dengan ventilasi punggung Aircomfort mesh system. Sangat nyaman untuk pendakian 2-3 hari.',
      capacity: 1,
      dimension: '72 x 34 x 25 cm',
      weightKg: 1.6,
      pricePerDay: 45000,
      cleaningDays: 1,
      includedItems: JSON.stringify(['Carrier Deuter 50L', 'Raincover Bawaan']),
      ratingAvg: 4.9,
      ratingCount: 42,
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
      ],
      unitPrefix: 'CR-DTR50',
      unitCount: 6,
    },
    {
      categoryId: catCarrier.id,
      name: 'Carrier Osprey Atmos AG 65L',
      slug: 'carrier-osprey-atmos-65l',
      description: 'Carrier premium dengan sistem suspensi Anti-Gravity 3D mesh. Mengurangi beban berat di punggung secara signifikan.',
      capacity: 1,
      dimension: '87 x 39 x 41 cm',
      weightKg: 2.1,
      pricePerDay: 65000,
      cleaningDays: 1,
      includedItems: JSON.stringify(['Carrier Osprey 65L', 'Raincover Waterproof']),
      ratingAvg: 5.0,
      ratingCount: 29,
      images: [
        'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=80',
      ],
      unitPrefix: 'CR-OSP65',
      unitCount: 5,
    },
    {
      categoryId: catFurniture.id,
      name: 'Set Meja Lipat & Kursi Naturehike (1 Meja + 2 Kursi)',
      slug: 'set-meja-kursi-naturehike',
      description: 'Furniture camping aluminium portabel yang ringkas dan kuat hingga bobot 120kg. Cocok untuk santai kopi sore.',
      capacity: 2,
      dimension: 'Meja 50x50x45 cm',
      weightKg: 3.2,
      pricePerDay: 40000,
      cleaningDays: 1,
      includedItems: JSON.stringify(['1 Meja Lipat Roll Aluminium', '2 Kursi Lipat Moon Chair', 'Tas Jinjing']),
      ratingAvg: 4.8,
      ratingCount: 35,
      images: [
        'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=80',
      ],
      unitPrefix: 'FRN-NH2',
      unitCount: 8,
    },
  ];

  const createdProducts: any[] = [];
  const createdUnits: any[] = [];

  for (const p of productsData) {
    const product = await prisma.product.create({
      data: {
        categoryId: p.categoryId,
        name: p.name,
        slug: p.slug,
        description: p.description,
        capacity: p.capacity,
        dimension: p.dimension,
        weightKg: p.weightKg,
        pricePerDay: p.pricePerDay,
        cleaningDays: p.cleaningDays,
        includedItems: p.includedItems,
        ratingAvg: p.ratingAvg,
        ratingCount: p.ratingCount,
      },
    });
    createdProducts.push(product);

    // Images
    for (let i = 0; i < p.images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: p.images[i],
          position: i,
        },
      });
    }

    // Units
    for (let u = 1; u <= p.unitCount; u++) {
      const code = `${p.unitPrefix}-${String(u).padStart(3, '0')}`;
      const unit = await prisma.productUnit.create({
        data: {
          productId: product.id,
          code,
          status: 'AVAILABLE',
        },
      });
      createdUnits.push(unit);
    }
  }

  console.log(`Created ${createdProducts.length} products with ${createdUnits.length} total units.`);

  // 5. Maintenance records (2-3 units in maintenance)
  const maintenanceUnit1 = createdUnits[3]; // TND-M4-004
  const maintenanceUnit2 = createdUnits[12]; // TND-E6-005
  await prisma.productUnit.update({
    where: { id: maintenanceUnit1.id },
    data: { status: 'MAINTENANCE' },
  });
  await prisma.maintenance.create({
    data: {
      unitId: maintenanceUnit1.id,
      issue: 'Frame fiber patah sambungan tengah akibat angin kencang di Prau',
      estimatedCost: 75000,
      startDate: subDays(new Date(), 2),
      expectedReadyDate: addDays(new Date(), 4),
      status: 'IN_PROGRESS',
    },
  });

  await prisma.productUnit.update({
    where: { id: maintenanceUnit2.id },
    data: { status: 'MAINTENANCE' },
  });
  await prisma.maintenance.create({
    data: {
      unitId: maintenanceUnit2.id,
      issue: 'Zipper flysheet luar macet dan perlu diganti resletingnya',
      estimatedCost: 50000,
      startDate: subDays(new Date(), 1),
      expectedReadyDate: addDays(new Date(), 3),
      status: 'OPEN',
    },
  });

  // 6. Realistic Rentals (~20 rentals spread around today's date)
  const today = new Date();

  const rentalSpecs = [
    // Completed rentals (past)
    {
      code: '#CR-2026-00101',
      customer: cust1,
      start: subDays(today, 10),
      end: subDays(today, 8),
      status: 'COMPLETED',
      itemIndexes: [0, 4, 6], // Consina 4P, Consina SB, Matras
      collateral: { type: 'KTP', holder: 'Dimas Pratama', status: 'RETURNED' },
      payment: { amount: 230000, status: 'VERIFIED' },
      collateralReceivedPast: true,
      collateralReturnedPast: true,
    },
    {
      code: '#CR-2026-00102',
      customer: cust2,
      start: subDays(today, 8),
      end: subDays(today, 6),
      status: 'COMPLETED',
      itemIndexes: [2, 8, 10], // Naturehike 2P, Kompor, Headlamp
      collateral: { type: 'SIM', holder: 'Anisa Lestari', status: 'RETURNED' },
      payment: { amount: 220000, status: 'VERIFIED' },
      fees: [{ type: 'CLEANING', amount: 25000, notes: 'Tenda kotor berlumpur setelah hujan' }],
      collateralReceivedPast: true,
      collateralReturnedPast: true,
    },
    {
      code: '#CR-2026-00103',
      customer: cust3,
      start: subDays(today, 6),
      end: subDays(today, 4),
      status: 'COMPLETED',
      itemIndexes: [1, 9, 14], // Eiger 6P, Nesting, Meja
      collateral: { type: 'KTP', holder: 'Fajar Ramadhan', status: 'RETURNED' },
      payment: { amount: 370000, status: 'VERIFIED' },
      collateralReceivedPast: true,
      collateralReturnedPast: true,
    },
    // Currently Rented (ongoing right now)
    {
      code: '#CR-2026-00104',
      customer: cust1,
      start: subDays(today, 1),
      end: addDays(today, 2),
      status: 'RENTED',
      itemIndexes: [0, 4, 8], // Consina 4P, SB, Kompor
      collateral: { type: 'KTP', holder: 'Dimas Pratama', status: 'HELD' },
      payment: { amount: 390000, status: 'VERIFIED' },
      collateralReceivedPast: true,
    },
    {
      code: '#CR-2026-00105',
      customer: cust2,
      start: subDays(today, 2),
      end: addDays(today, 1),
      status: 'RENTED',
      itemIndexes: [2, 5, 12], // Naturehike 2P, Deuter SB, Carrier 50L
      collateral: { type: 'KTM', holder: 'Anisa Lestari', status: 'HELD' },
      payment: { amount: 420000, status: 'VERIFIED' },
      collateralReceivedPast: true,
    },
    {
      code: '#CR-2026-00106',
      customer: cust3,
      start: subDays(today, 1),
      end: addDays(today, 1),
      status: 'RENTED',
      itemIndexes: [1, 14], // Eiger 6P, Set Meja Kursi
      collateral: { type: 'SIM', holder: 'Fajar Ramadhan', status: 'HELD' },
      payment: { amount: 320000, status: 'VERIFIED' },
      collateralReceivedPast: true,
    },
    // Ready for Pickup (scheduled for today or tomorrow)
    {
      code: '#CR-2026-00107',
      customer: cust1,
      start: today,
      end: addDays(today, 2),
      status: 'READY_FOR_PICKUP',
      itemIndexes: [13, 10], // Osprey 65L, Headlamp
      collateral: { type: 'KTP', holder: 'Dimas Pratama', status: 'PLANNED' },
      payment: { amount: 170000, status: 'VERIFIED' },
    },
    {
      code: '#CR-2026-00108',
      customer: cust2,
      start: addDays(today, 1),
      end: addDays(today, 3),
      status: 'READY_FOR_PICKUP',
      itemIndexes: [0, 6, 7], // Consina 4P, Matras Foil, Matras Angin
      collateral: { type: 'SIM', holder: 'Anisa Lestari', status: 'PLANNED' },
      payment: { amount: 240000, status: 'VERIFIED' },
    },
    // Confirmed bookings (next few days / next weekend)
    {
      code: '#CR-2026-00109',
      customer: cust3,
      start: addDays(today, 2),
      end: addDays(today, 4),
      status: 'CONFIRMED',
      itemIndexes: [2, 4, 8],
      collateral: { type: 'KTP', holder: 'Fajar Ramadhan', status: 'PLANNED' },
      payment: { amount: 230000, status: 'VERIFIED' },
    },
    {
      code: '#CR-2026-00110',
      customer: cust1,
      start: addDays(today, 3),
      end: addDays(today, 5),
      status: 'CONFIRMED',
      itemIndexes: [1, 14],
      collateral: { type: 'KTP', holder: 'Dimas Pratama', status: 'PLANNED' },
      payment: { amount: 320000, status: 'VERIFIED' },
    },
    {
      code: '#CR-2026-00111',
      customer: cust2,
      start: addDays(today, 4),
      end: addDays(today, 7),
      status: 'CONFIRMED',
      itemIndexes: [3, 9, 11], // 8P tent, Nesting, Lentera
      collateral: { type: 'KTM', holder: 'Anisa Lestari', status: 'PLANNED' },
      payment: { amount: 600000, status: 'VERIFIED' },
    },
    // Waiting Payment (recent order)
    {
      code: '#CR-2026-00112',
      customer: cust3,
      start: addDays(today, 3),
      end: addDays(today, 5),
      status: 'WAITING_PAYMENT',
      itemIndexes: [0, 4],
      collateral: { type: 'KTP', holder: 'Fajar Ramadhan', status: 'PLANNED' },
      payment: { amount: 200000, status: 'PENDING' },
      expiresAt: addDays(today, 1),
    },
    {
      code: '#CR-2026-00113',
      customer: cust1,
      start: addDays(today, 5),
      end: addDays(today, 7),
      status: 'WAITING_PAYMENT',
      itemIndexes: [12, 10],
      collateral: { type: 'KTP', holder: 'Dimas Pratama', status: 'PLANNED' },
      payment: { amount: 130000, status: 'PENDING' },
      expiresAt: addDays(today, 1),
    },
    // Overdue rental (ended yesterday, not yet returned)
    {
      code: '#CR-2026-00114',
      customer: cust2,
      start: subDays(today, 4),
      end: subDays(today, 1),
      status: 'OVERDUE',
      itemIndexes: [0, 8],
      collateral: { type: 'SIM', holder: 'Anisa Lestari', status: 'HELD' },
      payment: { amount: 315000, status: 'VERIFIED' },
      fees: [{ type: 'LATE', amount: 50000, notes: 'Terlambat 1 hari pengembalian' }],
      collateralReceivedPast: true,
    },
    // Returning (customer at store returning items)
    {
      code: '#CR-2026-00115',
      customer: cust3,
      start: subDays(today, 2),
      end: today,
      status: 'RETURNING',
      itemIndexes: [2, 4],
      collateral: { type: 'KTP', holder: 'Fajar Ramadhan', status: 'HELD' },
      payment: { amount: 170000, status: 'VERIFIED' },
      collateralReceivedPast: true,
    },
    // Cancelled rental
    {
      code: '#CR-2026-00116',
      customer: cust1,
      start: subDays(today, 3),
      end: subDays(today, 1),
      status: 'CANCELLED',
      itemIndexes: [3],
      collateral: { type: 'KTP', holder: 'Dimas Pratama', status: 'PLANNED' },
      payment: { amount: 320000, status: 'REJECTED' },
    },
  ];

  let unitPointer = 0;

  for (const rSpec of rentalSpecs) {
    let subtotal = 0;
    const days = Math.max(1, Math.round((rSpec.end.getTime() - rSpec.start.getTime()) / (1000 * 60 * 60 * 24)));

    // Calculate items
    const itemsData = rSpec.itemIndexes.map((idx) => {
      const prod = createdProducts[idx];
      const itemSubtotal = prod.pricePerDay * 1 * days;
      subtotal += itemSubtotal;
      return {
        productId: prod.id,
        quantity: 1,
        pricePerDay: prod.pricePerDay,
        days,
        subtotal: itemSubtotal,
      };
    });

    const feeAmount = (rSpec.fees || []).reduce((acc, f) => acc + f.amount, 0);
    const total = subtotal + feeAmount;

    const rental = await prisma.rental.create({
      data: {
        code: rSpec.code,
        customerId: rSpec.customer.id,
        startDate: rSpec.start,
        endDate: rSpec.end,
        status: rSpec.status,
        subtotal,
        extraFees: feeAmount,
        total,
        expiresAt: rSpec.expiresAt || null,
        notes: 'Pemesanan perlengkapan camping liburan akhir pekan.',
      },
    });

    // Create rental items & assign units if RENTED/COMPLETED/RETURNING/OVERDUE
    for (const itm of itemsData) {
      const rentalItem = await prisma.rentalItem.create({
        data: {
          rentalId: rental.id,
          productId: itm.productId,
          quantity: itm.quantity,
          pricePerDay: itm.pricePerDay,
          days: itm.days,
          subtotal: itm.subtotal,
        },
      });

      if (['RENTED', 'RETURNING', 'OVERDUE', 'COMPLETED'].includes(rSpec.status)) {
        // Find an active unit for this product
        const unit = createdUnits.find(
          (u) => u.productId === itm.productId && u.status === 'AVAILABLE'
        ) || createdUnits[unitPointer % createdUnits.length];
        unitPointer++;

        await prisma.rentalItemUnit.create({
          data: {
            rentalItemId: rentalItem.id,
            unitId: unit.id,
          },
        });

        // If currently rented, update unit status
        if (['RENTED', 'OVERDUE'].includes(rSpec.status)) {
          await prisma.productUnit.update({
            where: { id: unit.id },
            data: { status: 'RENTED' },
          });
        }
      }
    }

    // Payment
    await prisma.payment.create({
      data: {
        rentalId: rental.id,
        amount: rSpec.payment.amount,
        status: rSpec.payment.status,
        method: 'TRANSFER',
        paidAt: rSpec.payment.status === 'VERIFIED' ? rSpec.start : null,
      },
    });

    // Collateral
    await prisma.collateral.create({
      data: {
        rentalId: rental.id,
        type: rSpec.collateral.type,
        holderName: rSpec.collateral.holder,
        status: rSpec.collateral.status,
        receivedAt: rSpec.collateralReceivedPast ? rSpec.start : null,
        returnedAt: rSpec.collateralReturnedPast ? rSpec.end : null,
      },
    });

    // Fees if any
    if (rSpec.fees) {
      for (const f of rSpec.fees) {
        await prisma.fee.create({
          data: {
            rentalId: rental.id,
            type: f.type,
            amount: f.amount,
            notes: f.notes,
          },
        });
      }
    }

    // Checklist inspection for completed or rented
    if (['COMPLETED', 'RETURNING'].includes(rSpec.status)) {
      const sampleUnit = createdUnits[0];
      await prisma.checklist.create({
        data: {
          rentalId: rental.id,
          type: 'PICKUP',
          unitId: sampleUnit.id,
          condition: 'GOOD',
          notes: 'Unit dalam kondisi bersih dan frame lengkap sebelum diserahkan.',
          createdBy: 'Rian Saputra',
        },
      });
      await prisma.checklist.create({
        data: {
          rentalId: rental.id,
          type: 'RETURN',
          unitId: sampleUnit.id,
          condition: 'GOOD',
          notes: 'Unit dikembalikan lengkap, masuk masa pembersihan.',
          createdBy: 'Rian Saputra',
        },
      });
    }
  }

  console.log(`Created ${rentalSpecs.length} sample rentals.`);
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
