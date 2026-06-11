import path from "path";
import express from "express";
import { createApp, initDatabase, seedDefaultUser } from "./server";

let app: express.Express | null = null;

async function getApp(): Promise<express.Express> {
  if (app) return app;

  const { app: expressApp, pool } = createApp();
  await initDatabase(pool);
  await seedDefaultUser(pool);

  const distPath = path.join(process.cwd(), "dist");
  expressApp.use(express.static(distPath));
  expressApp.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });

  app = expressApp;
  return app;
}

export default async (req: any, res: any) => {
  const handler = await getApp();
  handler(req, res);
};
