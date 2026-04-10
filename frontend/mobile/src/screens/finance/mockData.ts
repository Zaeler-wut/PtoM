export type BillStatus = 'DRAFT' | 'READY' | 'PENDING' | 'VERIFYING' | 'PAID'
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CANCELLED'
export type ContractStatus = 'ACTIVE' | 'MOVE_OUT_NOTICE' | 'ENDED'

export interface BillItem {
  id: string
  title: string
  amount: number
}

export interface MockBill {
  id: string
  propertyName: string
  month: number
  year: number
  roomNumber: string
  tenantName: string
  roomRent: number
  items: BillItem[]
  total: number
  status: BillStatus
  dueDate: string
}

export interface MockBooking {
  id: string
  propertyName: string
  roomType: string
  roomNumber: string
  tenantName: string
  moveInDate: string
  bookingFee: number
  rentPerMonth: number
  status: BookingStatus
  bookedAt: string
}

export interface MockContract {
  id: string
  propertyName: string
  roomNumber: string
  startDate: string
  durationYear: number
  status: ContractStatus
  pdfUrl?: string
}

export const MONTH_TH = ['', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

export function formatAmount(amount: number) {
  return amount.toLocaleString('th-TH')
}

export function formatMonth(month: number, year: number) {
  return `บิลรอบ ${MONTH_TH[month]} ${year}`
}

export const MOCK_BILLS: MockBill[] = [
  {
    id: '1',
    propertyName: 'Purple Residence',
    month: 2, year: 2026,
    roomNumber: '301',
    tenantName: 'วุฒิพงศ์ จงกสิกรรม',
    roomRent: 6500,
    items: [
      { id: 'i1', title: 'ค่าไฟฟ้า (180 หน่วย)', amount: 1260 },
      { id: 'i2', title: 'ค่าน้ำ (10 หน่วย)', amount: 200 },
      { id: 'i3', title: 'ค่าส่วนกลาง', amount: 200 },
    ],
    total: 8160,
    status: 'PENDING',
    dueDate: '05 มี.ค. 2026',
  },
  {
    id: '2',
    propertyName: 'Purple Residence',
    month: 1, year: 2026,
    roomNumber: '301',
    tenantName: 'วุฒิพงศ์ จงกสิกรรม',
    roomRent: 6500,
    items: [
      { id: 'i4', title: 'ค่าไฟฟ้า (175 หน่วย)', amount: 1225 },
      { id: 'i5', title: 'ค่าน้ำ (8 หน่วย)', amount: 160 },
      { id: 'i6', title: 'ค่าส่วนกลาง', amount: 200 },
    ],
    total: 8085,
    status: 'PAID',
    dueDate: '05 ก.พ. 2026',
  },
]

export const MOCK_BOOKINGS: MockBooking[] = [
  {
    id: 'b1',
    propertyName: 'Purple Residence',
    roomType: 'Deluxe', roomNumber: '301',
    tenantName: 'วุฒิพงศ์ จงกสิกรรม',
    moveInDate: '01 ต.ค. 2025',
    bookingFee: 13000, rentPerMonth: 6500,
    status: 'CONFIRMED',
    bookedAt: '15 ก.ย. 2025 07:00 น.',
  },
  {
    id: 'b2',
    propertyName: 'Purple Residence',
    roomType: 'Suite', roomNumber: '302',
    tenantName: 'วุฒิพงศ์ จงกสิกรรม',
    moveInDate: '20 มี.ค. 2026',
    bookingFee: 15000, rentPerMonth: 7500,
    status: 'PENDING',
    bookedAt: '01 มี.ค. 2026 10:00 น.',
  },
]

export const MOCK_CONTRACTS: MockContract[] = [
  {
    id: 'c1',
    propertyName: 'Purple Residence',
    roomNumber: '301',
    startDate: '01 ต.ค. 2025',
    durationYear: 1,
    status: 'ACTIVE',
    pdfUrl: 'https://example.com/contract.pdf',
  },
]