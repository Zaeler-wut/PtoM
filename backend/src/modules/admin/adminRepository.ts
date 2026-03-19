import { prisma } from "../../lib/prisma"
import * as repo from "./adminRepository"


export const getAdminProperties = async (userId: string) => {
  return prisma.propertyAdmin.findMany({
    where: {
      userId
    },
    include: {
      property: {
        include: {
          rooms: true,
          bookings: true,
          images: true
        }
      }
    }
  });
};


export const createPropertyWithAdmin = async (data: any) => {

  return prisma.property.create({
    data: {
      name: data.name,
      address: data.address,
      googleMap: data.googleMap,
      description: data.description,

      priceMin: data.priceMin,
      priceMax: data.priceMax,

      contractTerm: data.contractTerm,

      bankName: data.bankName,
      bankAccount: data.bankAccount,
      bankHolder: data.bankHolder,

      paymentQrUrl: data.paymentQrUrl,
      logoUrl: data.logoUrl,

      // assign admin
      admins: {
        create: {
          userId: data.userId
        }
      }
    }
  })
}



export const getUserById = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId }
  });
};



export const getPropertyById = async (propertyId: string) => {
  return prisma.property.findUnique({
    where: { id: propertyId }
  });
};



// เช็คสิทธิ์
export const checkPropertyAdmin = async (
  userId: string,
  propertyId: string
) => {
  return prisma.propertyAdmin.findFirst({
    where: {
      userId,
      propertyId
    }
  });
};


// สร้างประเภทห้อง และกำหนดราคา
export const createRoomType = async (
  propertyId: string,
  data: any
) => {

  // หา facility จากชื่อ
  const facilities = await Promise.all(
    (data.facilities || []).map(async (name: string) => {

      let facility = await prisma.facility.findUnique({
        where: { name }
      });

      // ถ้ายังไม่มี  create ใหม่
      if (!facility) {
        facility = await prisma.facility.create({
          data: { name }
        });
      }

      return facility;
    })
  );

  return prisma.roomType.create({
    data: {
      propertyId,

      name: data.name,
      description: data.description,
      size: data.size,
      maxOccupants: data.maxOccupants,

      roomPrice: data.roomPrice,
      furniturePrice: data.furniturePrice,

      bookingFee: data.bookingFee,
      advanceRent: data.advanceRent,
      securityDeposit: data.securityDeposit,

      waterRate: data.waterRate,
      electricRate: data.electricRate,

      allowOnlineBooking: data.allowOnlineBooking ?? true,

      // facilities (ใช้ id หลังแปลงแล้ว)
      facilities: {
        create: facilities.map((f) => ({
          facilityId: f.id
        }))
      },

      // images
      images: {
        create: (data.images || []).slice(0, 5).map((url: string) => ({
          url
        }))
      },

      // fees
      fees: {
        create: (data.fees || []).map((f: any) => ({
          title: f.title,
          amount: f.amount
        }))
      }
    }
  });
};



// ดึงข้อมูลประเภทห้อง
export const getRoomTypeById = async (roomTypeId: string) => {
  return prisma.roomType.findUnique({
    where: { id: roomTypeId },
    include: {
      images: true,
      fees: true,
      facilities: {
        include: {
          facility: true
        }
      }
    }
  });
};


export const getDashboardData = async (propertyId: string) => {

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      rooms: true,
      bookings: true
    }
  });

  const bills = await prisma.bill.findMany({
    where: {
      room: {
        propertyId
      }
    }
  });

  return {
    property,
    bills
  };
};


// จัดการห้อง
export const getRoomsByProperty = async (propertyId: string) => {
  return prisma.room.findMany({
    where: { propertyId },
    include: {
      roomType: true,
      contracts: {
        where: {
          status: "ACTIVE"
        },
        include: {
          user: true
        }
      }
    }
  });
};


// สร้างห้อง
export const createRoom = async (data: {
  propertyId: string;
  roomTypeId: string;
  roomNumber: string;
  floor?: number;
}) => {

  return prisma.room.create({
    data: {
      propertyId: data.propertyId,
      roomTypeId: data.roomTypeId,
      roomNumber: data.roomNumber,
      floor: data.floor ?? null,
      status: "AVAILABLE"
    }
  });
};