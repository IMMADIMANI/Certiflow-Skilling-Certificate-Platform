import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/database';
import { createAuditLog } from '../audit/audit.service';
import { AuthRequest } from '../../middleware/auth.middleware';

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'certiflow-secret',
      { expiresIn: '7d' }
    );
    await createAuditLog({
      userId: user.id,
      action: 'LOGIN',
      entityType: 'USER',
      entityId: user.id,
      remarks: 'User logged in',
    });
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error('[Auth] Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getDemoAccounts(_req: Request, res: Response): Promise<void> {
  const accounts = [
    { name: 'Anika Singh', email: 'anika@certiflow.in', role: 'TRAINING_CENTRE', password: 'password123', description: 'Training Centre Manager' },
    { name: 'Dev Sharma', email: 'dev@certiflow.in', role: 'DISTRICT_OFFICER', password: 'password123', description: 'District Officer - North' },
    { name: 'Meera Patel', email: 'meera@certiflow.in', role: 'DISTRICT_OFFICER', password: 'password123', description: 'District Officer - South' },
    { name: 'Kabir Khan', email: 'kabir@certiflow.in', role: 'DISTRICT_OFFICER', password: 'password123', description: 'District Officer - East' },
    { name: 'Neha Gupta', email: 'neha@certiflow.in', role: 'QUALITY_TEAM', password: 'password123', description: 'Quality Review Officer' },
    { name: 'Farah Irani', email: 'farah@certiflow.in', role: 'STATE_OFFICE', password: 'password123', description: 'State Office Director' },
  ];
  res.json(accounts);
}
