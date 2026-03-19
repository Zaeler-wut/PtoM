import * as repo from "./adminRepository";


// สร้างสถานที่
export const createProperty = async (data: any) => {

  if (!data.userId) {
    throw new Error("userId is required")
  }

  if (!data.name) {
    throw new Error("name is required")
  }

  if (!data.address) {
    throw new Error("address is required")
  }

  const property = await repo.createPropertyWithAdmin(data)

  return property
}


// สร้างประเภทห้องและราคา
export const createRoomType = async (
  propertyId: string,
  data: any
) => {

  if (!data.name) throw new Error("name is required");

  return repo.createRoomType(propertyId, data);
};



// ดึงข้อมูลหน้าเลือกสถานที่
export const getMyProperties = async (userId: string) => {

  const data = await repo.getAdminProperties(userId);

  return data.map((item) => {

    const property = item.property;

    const totalRooms = property.rooms.length;

    const occupied = property.rooms.filter(
      (r) => r.status === "OCCUPIED"
    ).length;

    const available = property.rooms.filter(
      (r) => r.status === "AVAILABLE"
    ).length;

    const reserved = property.rooms.filter(
      (r) => r.status === "RESERVED"
    ).length;

    const coverImage =
      property.images.find((img) => img.isCover)?.url ||
      property.images[0]?.url ||
      null;

    return {
      id: property.id,
      name: property.name,
      address: property.address,
      coverImage,

      totalRooms,
      available,
      occupied,
      reserved,

      bookingCount: property.bookings.length
    };
  });
};


// ดึงข้อมูลประเภทห้อง
export const getRoomTypeDetail = async (roomTypeId: string) => {

  const rt = await repo.getRoomTypeById(roomTypeId);

  if (!rt) throw new Error("RoomType not found");

  return {
    id: rt.id,
    name: rt.name,
    description: rt.description,

    size: rt.size,
    maxOccupants: rt.maxOccupants,

    price: rt.roomPrice,
    furniturePrice: rt.furniturePrice,

    waterRate: rt.waterRate,
    electricRate: rt.electricRate,

    bookingFee: rt.bookingFee,
    advanceRent: rt.advanceRent,
    securityDeposit: rt.securityDeposit,

    allowOnlineBooking: rt.allowOnlineBooking,

    images: rt.images.map(i => i.url),

    fees: rt.fees.map(f => ({
      title: f.title,
      amount: f.amount
    })),

    facilities: rt.facilities.map(f => f.facility.name)
  };
};




export const getDashboard = async (propertyId: string) => {

  const { property, bills } = await repo.getDashboardData(propertyId);

  if (!property) throw new Error("Property not found");

  const totalRooms = property.rooms.length;

  const available = property.rooms.filter(r => r.status === "AVAILABLE").length;

  const preparing = property.rooms.filter(r => r.status === "PREPARING").length;

  const reserved = property.rooms.filter(r => r.status === "RESERVED").length;

  const occupied = property.rooms.filter(r => r.status === "OCCUPIED").length;

  const maintenance = property.rooms.filter(r => r.status === "MAINTENANCE").length;

  // 🔥 ห้องจองได้ = AVAILABLE + PREPARING
  const bookableRooms = available + preparing;

  // 🔥 booking
  const pendingBookings = property.bookings.filter(
    b => b.status === "PENDING"
  ).length;

  // 🔥 บิลรอยืนยัน (VERIFYING)
  const verifyingBills = bills.filter(
    b => b.status === "VERIFYING"
  ).length;

  // 🔥 บิลค้าง (ยังไม่จ่าย)
  const unpaidBills = bills.filter(
    b => b.status !== "PAID"
  ).length;

  // 🔥 รายได้
  const monthlyRevenue = bills
    .filter(b => b.status === "PAID")
    .reduce((sum, b) => sum + b.total, 0);

  return {
    totalRooms,

    available,
    preparing,
    bookableRooms, // 👈 เพิ่มใหม่
    reserved,
    occupied,
    maintenance,

    pendingBookings,
    verifyingBills, // 👈 เพิ่มใหม่
    unpaidBills,

    monthlyRevenue
  };
};


// จัดการห้อง
export const getRooms = async (propertyId: string) => {

  const rooms = await repo.getRoomsByProperty(propertyId);

  return rooms.map((room) => {

    const activeContract = room.contracts[0];

    return {
      id: room.id,
      roomNumber: room.roomNumber,
      floor: room.floor,

      roomType: room.roomType.name,
      price: room.roomType.roomPrice,

      status: room.status,

      tenant: activeContract
        ? `${activeContract.user.firstName} ${activeContract.user.lastName}`
        : null
    };
  });
};


export const createRoom = async (
  propertyId: string,
  data: any
) => {

  // 🔥 validation เบื้องต้น
  if (!data.roomNumber) {
    throw new Error("roomNumber is required");
  }

  if (!data.roomTypeId) {
    throw new Error("roomTypeId is required");
  }

  return repo.createRoom({
    propertyId,
    roomTypeId: data.roomTypeId,
    roomNumber: data.roomNumber,
    floor: data.floor
  });
};