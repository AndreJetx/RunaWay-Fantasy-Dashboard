import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertCharacterSchema, 
  insertItemSchema,
  insertCampaignSchema,
  insertMapSchema,
  insertNoteSchema
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }

      const existingUser = await storage.getUserByUsername(result.data.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(result.data.password, SALT_ROUNDS);
      const user = await storage.createUser({ 
        username: result.data.username, 
        password: hashedPassword,
        role: result.data.role || "player"
      });

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ error: "Failed to login after registration" });
        }
        res.json({ user: { id: user.id, username: user.username, role: user.role } });
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ error: "Failed to login" });
        }
        res.json({ user: { id: user.id, username: user.username, role: user.role } });
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/user", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ user: { id: req.user.id, username: req.user.username, role: req.user.role } });
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  });

  // Campaigns Routes
  app.get("/api/campaigns", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const campaigns = await storage.getCampaigns(req.user.id, req.user.role);
    res.json(campaigns);
  });

  app.get("/api/campaigns/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const campaign = await storage.getCampaign(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    
    const isInCampaign = await storage.isUserInCampaign(req.params.id, req.user.id);
    if (!isInCampaign) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    res.json(campaign);
  });

  app.post("/api/campaigns", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (req.user.role !== "dm") {
      return res.status(403).json({ error: "Only DMs can create campaigns" });
    }
    try {
      const result = insertCampaignSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      const campaign = await storage.createCampaign(result.data, req.user.id);
      res.json(campaign);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/campaigns/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (req.user.role !== "dm") {
      return res.status(403).json({ error: "Only DMs can update campaigns" });
    }
    try {
      const campaign = await storage.updateCampaign(req.params.id, req.body, req.user.id);
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/campaigns/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (req.user.role !== "dm") {
      return res.status(403).json({ error: "Only DMs can delete campaigns" });
    }
    const success = await storage.deleteCampaign(req.params.id, req.user.id);
    if (!success) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    res.json({ success: true });
  });

  // Campaign Members
  app.get("/api/campaigns/:id/members", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const isInCampaign = await storage.isUserInCampaign(req.params.id, req.user.id);
    if (!isInCampaign) {
      return res.status(403).json({ error: "Access denied" });
    }
    const members = await storage.getCampaignMembers(req.params.id);
    res.json(members.map(m => ({ id: m.id, username: m.user.username, joinedAt: m.joinedAt })));
  });

  app.post("/api/campaigns/join", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (req.user.role !== "player") {
      return res.status(403).json({ error: "Only players can join campaigns" });
    }
    try {
      const { inviteCode } = req.body;
      const campaign = await storage.getCampaignByInviteCode(inviteCode);
      if (!campaign) {
        return res.status(404).json({ error: "Invalid invite code" });
      }
      
      const isAlreadyMember = await storage.isUserInCampaign(campaign.id, req.user.id);
      if (isAlreadyMember) {
        return res.status(400).json({ error: "Already a member of this campaign" });
      }
      
      const member = await storage.addCampaignMember(campaign.id, req.user.id);
      res.json({ campaign, member });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/campaigns/:id/members/:userId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const campaign = await storage.getCampaign(req.params.id);
    if (!campaign || campaign.dmId !== req.user.id) {
      return res.status(403).json({ error: "Only the DM can remove members" });
    }
    const success = await storage.removeCampaignMember(req.params.id, req.params.userId);
    if (!success) {
      return res.status(404).json({ error: "Member not found" });
    }
    res.json({ success: true });
  });

  // Characters Routes
  app.get("/api/campaigns/:campaignId/characters", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const isInCampaign = await storage.isUserInCampaign(req.params.campaignId, req.user.id);
    if (!isInCampaign) {
      return res.status(403).json({ error: "Access denied" });
    }
    const characters = await storage.getCharactersByCampaign(req.params.campaignId);
    res.json(characters);
  });

  app.get("/api/characters", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const characters = await storage.getCharactersByPlayer(req.user.id);
    res.json(characters);
  });

  app.get("/api/characters/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const character = await storage.getCharacter(req.params.id);
    if (!character) {
      return res.status(404).json({ error: "Character not found" });
    }
    
    const isInCampaign = await storage.isUserInCampaign(character.campaignId, req.user.id);
    if (!isInCampaign) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    res.json(character);
  });

  app.post("/api/characters", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const result = insertCharacterSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      
      const isInCampaign = await storage.isUserInCampaign(result.data.campaignId, req.user.id);
      if (!isInCampaign) {
        return res.status(403).json({ error: "You must be a member of this campaign" });
      }
      
      const character = await storage.createCharacter(result.data, req.user.id);
      
      await storage.logCharacterChange({
        characterId: character.id,
        playerId: req.user.id,
        campaignId: character.campaignId,
        changeType: "create",
        description: `New character "${character.name}" (${character.characterClass} Level ${character.level}) created`
      });
      
      res.json(character);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/characters/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const existingCharacter = await storage.getCharacter(req.params.id);
      if (!existingCharacter) {
        return res.status(404).json({ error: "Character not found" });
      }
      
      const campaign = await storage.getCampaign(existingCharacter.campaignId);
      const isDm = campaign?.dmId === req.user.id;
      const isOwner = existingCharacter.playerId === req.user.id;
      
      if (!isDm && !isOwner) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const character = await storage.updateCharacter(req.params.id, req.body, req.user.id, isDm);
      if (!character) {
        return res.status(404).json({ error: "Character not found" });
      }
      
      const changedFields = Object.keys(req.body);
      for (const field of changedFields) {
        const oldValue = (existingCharacter as any)[field];
        const newValue = req.body[field];
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          await storage.logCharacterChange({
            characterId: character.id,
            playerId: req.user.id,
            campaignId: character.campaignId,
            changeType: "update",
            fieldChanged: field,
            oldValue: typeof oldValue === 'object' ? JSON.stringify(oldValue) : String(oldValue ?? ''),
            newValue: typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue ?? ''),
            description: `${field} changed from ${oldValue} to ${newValue}`
          });
        }
      }
      
      res.json(character);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/characters/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const character = await storage.getCharacter(req.params.id);
    if (!character) {
      return res.status(404).json({ error: "Character not found" });
    }
    
    const campaign = await storage.getCampaign(character.campaignId);
    const isDm = campaign?.dmId === req.user.id;
    
    const success = await storage.deleteCharacter(req.params.id, req.user.id, isDm);
    if (!success) {
      return res.status(404).json({ error: "Character not found" });
    }
    res.json({ success: true });
  });

  // Character Change Logs (DM only)
  app.get("/api/campaigns/:campaignId/changelog", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const campaign = await storage.getCampaign(req.params.campaignId);
    if (!campaign || campaign.dmId !== req.user.id) {
      return res.status(403).json({ error: "Only DMs can view change logs" });
    }
    
    const unseen = req.query.unseen === "true";
    const logs = await storage.getChangeLogsByCampaign(req.params.campaignId, unseen);
    res.json(logs);
  });

  app.post("/api/campaigns/:campaignId/changelog/mark-seen", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const campaign = await storage.getCampaign(req.params.campaignId);
    if (!campaign || campaign.dmId !== req.user.id) {
      return res.status(403).json({ error: "Only DMs can mark logs as seen" });
    }
    
    await storage.markAllChangeLogsAsSeen(req.params.campaignId);
    res.json({ success: true });
  });

  // Items Routes
  app.get("/api/items", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const campaignId = req.query.campaignId as string | undefined;
    const items = await storage.getItems(req.user.id, campaignId);
    res.json(items);
  });

  app.post("/api/items", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const result = insertItemSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      const item = await storage.createItem(result.data, req.user.id);
      res.json(item);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/items/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const success = await storage.deleteItem(req.params.id, req.user.id);
    if (!success) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json({ success: true });
  });

  // Maps Routes
  app.get("/api/campaigns/:campaignId/maps", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const campaign = await storage.getCampaign(req.params.campaignId);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    
    const isInCampaign = await storage.isUserInCampaign(req.params.campaignId, req.user.id);
    if (!isInCampaign) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const isDm = campaign.dmId === req.user.id;
    const maps = await storage.getMaps(req.params.campaignId, isDm);
    res.json(maps);
  });

  app.post("/api/maps", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (req.user.role !== "dm") {
      return res.status(403).json({ error: "Only DMs can create maps" });
    }
    try {
      const result = insertMapSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      const map = await storage.createMap(result.data, req.user.id);
      res.json(map);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/maps/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (req.user.role !== "dm") {
      return res.status(403).json({ error: "Only DMs can delete maps" });
    }
    const success = await storage.deleteMap(req.params.id, req.user.id);
    if (!success) {
      return res.status(404).json({ error: "Map not found" });
    }
    res.json({ success: true });
  });

  // Notes Routes
  app.get("/api/campaigns/:campaignId/notes", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (req.user.role !== "dm") {
      return res.status(403).json({ error: "Only DMs can view notes" });
    }
    const notes = await storage.getNotes(req.params.campaignId, req.user.id);
    res.json(notes);
  });

  app.post("/api/notes", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (req.user.role !== "dm") {
      return res.status(403).json({ error: "Only DMs can create notes" });
    }
    try {
      const result = insertNoteSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      const note = await storage.createNote(result.data, req.user.id);
      res.json(note);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/notes/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (req.user.role !== "dm") {
      return res.status(403).json({ error: "Only DMs can update notes" });
    }
    try {
      const note = await storage.updateNote(req.params.id, req.body, req.user.id);
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }
      res.json(note);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/notes/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (req.user.role !== "dm") {
      return res.status(403).json({ error: "Only DMs can delete notes" });
    }
    const success = await storage.deleteNote(req.params.id, req.user.id);
    if (!success) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json({ success: true });
  });

  return httpServer;
}
