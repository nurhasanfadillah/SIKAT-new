import express from "express";
import { createApp, initDatabase, seedDefaultUser } from "./server";

let app: express.Express | null = null;

async function getApp(): Promise<express.Express> {
  if (app) return app;
  const { app: expressApp, pool } = createApp();
  await initDatabase(pool);
  await seedDefaultUser(pool);
  app = expressApp;
  return app;
}

export default async (req: any, res: any) => {
  try {
    const handler = await getApp();
    handler(req, res);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Server initialization failed' });
  }
};
