import type { Express, Request, Response, NextFunction } from "express";
import { ObjectStorageService, ObjectNotFoundError, objectStorageClient } from "./objectStorage";
import { setObjectAclPolicy } from "./objectAcl";
import { db } from "db";
import { sql } from "drizzle-orm";
import { randomUUID } from "crypto";

/**
 * Register object storage routes for file uploads.
 *
 * This provides routes for the presigned URL upload flow:
 * 1. POST /api/uploads/request-url - Get a presigned URL for uploading
 * 2. POST /api/user-files/register - Register uploaded file in database
 * 3. GET /api/user-files - List user's files
 * 4. DELETE /api/user-files/:id - Delete a file
 */
export function registerObjectStorageRoutes(app: Express, requireAuth: any): void {
  const objectStorageService = new ObjectStorageService();

  /**
   * Request a presigned URL for file upload (requires auth).
   */
  app.post("/api/uploads/request-url", requireAuth, async (req: Request, res: Response) => {
    try {
      const { name, size, contentType } = req.body;
      const userId = (req as any).user?.id;

      if (!name) {
        return res.status(400).json({
          error: "Missing required field: name",
        });
      }

      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);

      res.json({
        uploadURL,
        objectPath,
        metadata: { name, size, contentType },
      });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  /**
   * Register an uploaded file in the database.
   */
  app.post("/api/user-files/register", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { objectPath, fileName, fileSize, contentType } = req.body;

      if (!objectPath || !fileName) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const fileId = randomUUID();

      await db.execute(sql`
        INSERT INTO user_files (id, user_id, object_path, file_name, file_size, content_type, created_at)
        VALUES (${fileId}, ${userId}, ${objectPath}, ${fileName}, ${fileSize || 0}, ${contentType || 'application/octet-stream'}, NOW())
      `);

      // Set ACL policy - private, owned by user
      try {
        const objectFile = await objectStorageService.getObjectEntityFile(objectPath);
        await setObjectAclPolicy(objectFile, {
          owner: userId,
          visibility: "private",
        });
      } catch (aclError) {
        console.warn("Could not set ACL policy:", aclError);
      }

      res.json({ success: true, fileId });
    } catch (error) {
      console.error("Error registering file:", error);
      res.status(500).json({ error: "Failed to register file" });
    }
  });

  /**
   * List user's files.
   */
  app.get("/api/user-files", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;

      const result = await db.execute(sql`
        SELECT id, file_name, file_size, content_type, created_at
        FROM user_files
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
      `);

      res.json({ files: result.rows });
    } catch (error) {
      console.error("Error listing files:", error);
      res.status(500).json({ error: "Failed to list files" });
    }
  });

  /**
   * Delete a user's file.
   */
  app.delete("/api/user-files/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const fileId = req.params.id;

      // Get file info
      const result = await db.execute(sql`
        SELECT object_path FROM user_files
        WHERE id = ${fileId} AND user_id = ${userId}
      `);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "File not found" });
      }

      const objectPath = (result.rows[0] as any).object_path;

      // Delete from object storage
      try {
        const objectFile = await objectStorageService.getObjectEntityFile(objectPath);
        await objectFile.delete();
      } catch (deleteError) {
        console.warn("Could not delete from storage:", deleteError);
      }

      // Delete from database
      await db.execute(sql`
        DELETE FROM user_files WHERE id = ${fileId} AND user_id = ${userId}
      `);

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ error: "Failed to delete file" });
    }
  });

  /**
   * Download a user's file.
   */
  app.get("/api/user-files/:id/download", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const fileId = req.params.id;

      const result = await db.execute(sql`
        SELECT object_path, file_name, content_type FROM user_files
        WHERE id = ${fileId} AND user_id = ${userId}
      `);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "File not found" });
      }

      const { object_path, file_name, content_type } = result.rows[0] as any;

      const objectFile = await objectStorageService.getObjectEntityFile(object_path);
      
      res.set({
        "Content-Disposition": `attachment; filename="${file_name}"`,
        "Content-Type": content_type || "application/octet-stream",
      });

      await objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error downloading file:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.status(404).json({ error: "File not found" });
      }
      res.status(500).json({ error: "Failed to download file" });
    }
  });

  /**
   * Serve uploaded objects. Public objects are accessible without auth;
   * private objects require the requester to be the authenticated owner.
   */
  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);

      const userId = (req as any).user?.id;
      const canAccess = await objectStorageService.canAccessObjectEntity({
        userId,
        objectFile,
      });

      if (!canAccess) {
        return res.status(403).json({ error: "Toegang geweigerd" });
      }

      await objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.status(404).json({ error: "Object not found" });
      }
      return res.status(500).json({ error: "Failed to serve object" });
    }
  });
}
