import { PrismaClient } from "@prisma/client"

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  var dp: undefined | ReturnType<typeof prismaClientSingleton>
}

const db = globalThis.dp ?? prismaClientSingleton()

export default db

if (process.env.NODE_ENV !== "production") globalThis.dp = db