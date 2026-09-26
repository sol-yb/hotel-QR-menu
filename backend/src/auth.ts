import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'
import { prisma } from './prisma.js'

const sessionCookie = 'hotel_session'

function jwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is required for admin authentication.')
  return secret
}

export function hasAdminSession(request: Request) {
  const token = request.cookies?.[sessionCookie]
  if (!token) return false

  try {
    const payload = jwt.verify(token, jwtSecret())
    return typeof payload === 'object' && payload.role === 'ADMIN'
  } catch {
    return false
  }
}

export async function loginAdmin(email: string, password: string, response: Response) {
  const user = await prisma.user.findFirst({ where: { email, role: 'ADMIN' } })
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return false

  const token = jwt.sign({ userId: user.id, role: user.role }, jwtSecret(), { expiresIn: '8h' })
  response.cookie(sessionCookie, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 8 * 60 * 60 * 1000,
  })
  return true
}

export function requireAdmin(request: Request, response: Response, next: NextFunction) {
  if (!request.cookies?.[sessionCookie]) {
    response.status(401).json({ message: 'Administrator login is required.' })
    return
  }

  if (!hasAdminSession(request)) {
    response.status(401).json({ message: 'Your administrator session has expired.' })
    return
  }
  next()
}
