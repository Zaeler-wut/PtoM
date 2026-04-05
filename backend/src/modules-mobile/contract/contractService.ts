import * as repo from "./contractRepository"
import type { MyContractItem } from "./contractModel"

export const getMyContracts = async (userId: string): Promise<MyContractItem[]> => {
  const contracts = await repo.getMyContracts(userId)

  return contracts.map((c) => {
    const months = Math.round(
      (c.endDate.getTime() - c.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    )
    const duration = months >= 12
      ? `${Math.floor(months / 12)} ปี${months % 12 > 0 ? ` ${months % 12} เดือน` : ""}`
      : `${months} เดือน`

    return {
      contractId: c.id,
      propertyName: c.room.property.name,
      roomNumber: c.room.roomNumber,
      contractDuration: duration,
      startDate: c.startDate.toISOString().split("T")[0],
      endDate: c.endDate.toISOString().split("T")[0],
      status: c.status as any,
      pdfUrl: c.pdfUrl,
    }
  })
}
