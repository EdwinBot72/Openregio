import {
  type Entrepreneur,
  type InsertEntrepreneur,
  type StrictInsertEntrepreneur,
  type Proposal,
  type InsertProposal,
  type Activity,
  type InsertActivity,
  type ChatRoom,
  type InsertChatRoom,
  type ChatMessage,
  type InsertChatMessage,
  entrepreneurs,
  proposals,
  activities,
  chatRooms,
  chatMessages,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "db";
import { eq, ilike, or, desc, sql } from "drizzle-orm";

// Haversine formula to calculate distance between two lat/lng points in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface IStorage {
  // Entrepreneurs
  getEntrepreneurs(search?: string, category?: string, lat?: number, lng?: number, radius?: number): Promise<Entrepreneur[]>;
  getEntrepreneur(id: string): Promise<Entrepreneur | undefined>;
  createEntrepreneur(entrepreneur: StrictInsertEntrepreneur): Promise<Entrepreneur>;
  updateEntrepreneur(id: string, entrepreneur: Partial<InsertEntrepreneur>): Promise<Entrepreneur | undefined>;
  deleteEntrepreneur(id: string): Promise<boolean>;

  // Proposals
  getProposals(status?: string): Promise<Proposal[]>;
  getProposal(id: string): Promise<Proposal | undefined>;
  createProposal(proposal: InsertProposal): Promise<Proposal>;
  voteOnProposal(id: string, voteType: "for" | "against" | "abstain"): Promise<Proposal | undefined>;

  // Activities
  getRecentActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Chat Rooms
  getChatRooms(): Promise<ChatRoom[]>;
  getChatRoom(id: string): Promise<ChatRoom | undefined>;
  createChatRoom(room: InsertChatRoom): Promise<ChatRoom>;

  // Chat Messages
  getChatMessages(roomId: string, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;

  // Stats
  getStats(): Promise<{
    totalMembers: number;
    totalCollaborations: number;
    totalRegions: number;
    monthlyGrowth: number;
  }>;
}

export class MemStorage implements IStorage {
  private entrepreneurs: Map<string, Entrepreneur>;
  private proposals: Map<string, Proposal>;
  private activities: Map<string, Activity>;
  private chatRooms: Map<string, ChatRoom>;
  private chatMessages: Map<string, ChatMessage>;

  constructor() {
    this.entrepreneurs = new Map();
    this.proposals = new Map();
    this.activities = new Map();
    this.chatRooms = new Map();
    this.chatMessages = new Map();
    this.seedData();
  }

  private seedData() {
    const sampleEntrepreneurs: InsertEntrepreneur[] = [
      {
        ownerUserId: "user-maria",
        name: "Bakkerij De Gouden Korrel",
        owner: "Maria van den Berg",
        email: "maria@goudenkorre.nl",
        phone: "+31 20 123 4567",
        website: "https://goudenkorre.nl",
        category: "Bakkerij",
        description: "Ambachtelijke bakkerij met verse broodjes en gebak, elke dag vers gebakken met lokale ingrediënten.",
        location: "Amsterdam Noord",
        address: "Buikslotermeerplein 101, 1025 ET Amsterdam",
        city: "Amsterdam",
        lat: 52.3980,
        lng: 4.9426,
        openingHours: "Ma–Vr 07:00–18:00; Za 08:00–16:00",
        logoUrl: null,
        isVerified: true,
      },
      {
        ownerUserId: "user-jan",
        name: "Koffie & Co",
        owner: "Jan Pieters",
        email: "jan@koffieco.nl",
        phone: "+31 20 234 5678",
        website: "https://koffieco.nl",
        category: "Horeca",
        description: "Gezellig koffiehuis met specialty coffee en verse lunch.",
        location: "Amsterdam Centrum",
        address: "Haarlemmerstraat 45, 1013 EJ Amsterdam",
        city: "Amsterdam",
        lat: 52.3794,
        lng: 4.8858,
        openingHours: "Ma–Zo 08:00–22:00",
        logoUrl: null,
        isVerified: true,
      },
      {
        ownerUserId: "user-sophie",
        name: "Groen Advies",
        owner: "Sophie de Vries",
        email: "sophie@groenadvies.nl",
        phone: "+31 20 345 6789",
        website: "https://groenadvies.nl",
        category: "Consulting",
        description: "Duurzaamheidsadvies voor lokale bedrijven en MKB.",
        location: "Rotterdam",
        address: "Wijnhaven 23, 3011 WG Rotterdam",
        city: "Rotterdam",
        lat: 51.9184,
        lng: 4.4881,
        openingHours: "Ma–Vr 09:00–17:00",
        logoUrl: null,
        isVerified: false,
      },
      {
        ownerUserId: "user-pieter",
        name: "Tech Solutions NL",
        owner: "Pieter Jansen",
        email: "pieter@techsolutions.nl",
        phone: "+31 10 456 7890",
        website: "https://techsolutions.nl",
        category: "IT",
        description: "IT support en software development voor lokale bedrijven.",
        location: "Utrecht",
        address: "Vredenburg 12, 3511 BB Utrecht",
        city: "Utrecht",
        lat: 52.0930,
        lng: 5.1150,
        openingHours: "Ma–Vr 09:00–18:00",
        logoUrl: null,
        isVerified: true,
      },
      {
        ownerUserId: "user-lisa",
        name: "Bloemen & Planten",
        owner: "Lisa Bakker",
        email: "lisa@bloemenplanten.nl",
        phone: "+31 30 567 8901",
        website: "https://bloemenplanten.nl",
        category: "Retail",
        description: "Verse bloemen en planten voor elke gelegenheid.",
        location: "Den Haag",
        address: "Grote Marktstraat 89, 2511 BH Den Haag",
        city: "Den Haag",
        lat: 52.0774,
        lng: 4.3150,
        openingHours: "Ma–Za 09:00–18:00",
        logoUrl: null,
        isVerified: false,
      },
      {
        ownerUserId: "user-mark",
        name: "Fitness First",
        owner: "Mark de Jong",
        email: "mark@fitnessfirst.nl",
        phone: "+31 40 678 9012",
        website: "https://fitnessfirst.nl",
        category: "Sport",
        description: "Modern fitness centrum met personal training.",
        location: "Eindhoven",
        address: "Vestdijk 56, 5611 CG Eindhoven",
        city: "Eindhoven",
        lat: 51.4382,
        lng: 5.4796,
        openingHours: "Ma–Vr 06:00–23:00; Za–Zo 08:00–20:00",
        logoUrl: null,
        isVerified: false,
      },
    ];

    sampleEntrepreneurs.forEach((e) => {
      const id = randomUUID();
      this.entrepreneurs.set(id, { 
        id,
        ownerUserId: e.ownerUserId ?? null,
        name: e.name,
        owner: e.owner,
        email: e.email,
        phone: e.phone ?? null,
        website: e.website ?? null,
        category: e.category,
        description: e.description,
        location: e.location,
        address: e.address ?? null,
        city: e.city,
        lat: e.lat!,
        lng: e.lng!,
        openingHours: e.openingHours ?? null,
        logoUrl: e.logoUrl ?? null,
        image: e.image ?? null,
        isVerified: e.isVerified ?? false,
        createdAt: new Date() 
      });
    });

    const sampleProposals: InsertProposal[] = [
      {
        title: "Introductie van groepsaankopen voor leden",
        description: "Voorstel om gezamenlijke inkoop mogelijk te maken voor betere prijzen bij leveranciers.",
        proposerId: "1",
        proposerName: "Maria van den Berg",
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    ];

    sampleProposals.forEach((p) => {
      const id = randomUUID();
      this.proposals.set(id, {
        ...p,
        id,
        votesFor: "342",
        votesAgainst: "45",
        votesAbstain: "23",
        status: "active",
        createdAt: new Date(),
      });
    });

    const sampleActivities: InsertActivity[] = [
      {
        type: "lead",
        title: "Nieuwe samenwerking aanvraag",
        from: "Tech Solutions NL",
        entrepreneurId: null,
      },
      {
        type: "message",
        title: "Bericht ontvangen",
        from: "Sophie de Vries",
        entrepreneurId: null,
      },
      {
        type: "event",
        title: "Netwerkborrel volgende week",
        from: "OpenRegio Amsterdam",
        entrepreneurId: null,
      },
    ];

    sampleActivities.forEach((a, idx) => {
      const id = randomUUID();
      const createdAt = new Date(Date.now() - idx * 2 * 60 * 60 * 1000);
      this.activities.set(id, { 
        ...a, 
        id, 
        entrepreneurId: a.entrepreneurId ?? null,
        createdAt 
      });
    });

    const sampleChatRooms: InsertChatRoom[] = [
      {
        name: "Algemeen",
        description: "Algemene discussies en kennismaking",
        category: "general",
        createdBy: "system",
      },
      {
        name: "Horeca & Retail",
        description: "Voor ondernemers in horeca en retail sector",
        category: "Horeca",
        createdBy: "system",
      },
      {
        name: "Tech & IT",
        description: "Technologie, software en IT ondernemers",
        category: "IT",
        createdBy: "system",
      },
      {
        name: "Samenwerkingen",
        description: "Zoek partners en samenwerkingsmogelijkheden",
        category: "collaboration",
        createdBy: "system",
      },
    ];

    sampleChatRooms.forEach((r, idx) => {
      const id = randomUUID();
      this.chatRooms.set(id, {
        id,
        name: r.name,
        description: r.description ?? null,
        category: r.category ?? null,
        createdBy: r.createdBy,
        createdAt: new Date(Date.now() - idx * 24 * 60 * 60 * 1000),
      });
    });

    const roomIds = Array.from(this.chatRooms.keys());
    if (roomIds.length > 0) {
      const sampleMessages: InsertChatMessage[] = [
        {
          roomId: roomIds[0],
          userId: "user1",
          userName: "Maria van den Berg",
          message: "Welkom iedereen! Fijn dat jullie hier zijn.",
        },
        {
          roomId: roomIds[0],
          userId: "user2",
          userName: "Jan Pieters",
          message: "Dank je! Wat een mooie community wordt dit.",
        },
        {
          roomId: roomIds[0],
          userId: "user3",
          userName: "Sophie de Vries",
          message: "Hoi allemaal! Ik kijk ernaar uit om samen te werken.",
        },
      ];

      sampleMessages.forEach((m, idx) => {
        const id = randomUUID();
        this.chatMessages.set(id, {
          id,
          roomId: m.roomId,
          userId: m.userId,
          userName: m.userName,
          message: m.message,
          createdAt: new Date(Date.now() - (2 - idx) * 5 * 60 * 1000),
        });
      });
    }
  }

  async getEntrepreneurs(search?: string, category?: string, lat?: number, lng?: number, radius?: number): Promise<Entrepreneur[]> {
    let results = Array.from(this.entrepreneurs.values());

    if (search) {
      const searchLower = search.toLowerCase();
      results = results.filter(
        (e) =>
          e.name.toLowerCase().includes(searchLower) ||
          e.description.toLowerCase().includes(searchLower) ||
          e.location.toLowerCase().includes(searchLower)
      );
    }

    if (category) {
      results = results.filter((e) => e.category === category);
    }

    // Geo search filter
    if (lat !== undefined && lng !== undefined && radius !== undefined) {
      const maxRadius = Math.min(Math.max(radius, 0), 100); // Clamp radius between 0-100 km
      results = results.filter((e) => {
        if (e.lat == null || e.lng == null || !Number.isFinite(e.lat) || !Number.isFinite(e.lng)) return false;
        const distance = calculateDistance(lat, lng, e.lat, e.lng);
        return distance <= maxRadius;
      });
    }

    return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getEntrepreneur(id: string): Promise<Entrepreneur | undefined> {
    return this.entrepreneurs.get(id);
  }

  async createEntrepreneur(entrepreneur: StrictInsertEntrepreneur): Promise<Entrepreneur> {
    const id = randomUUID();
    const newEntrepreneur: Entrepreneur = {
      id,
      ownerUserId: entrepreneur.ownerUserId ?? null,
      name: entrepreneur.name,
      owner: entrepreneur.owner,
      email: entrepreneur.email,
      phone: entrepreneur.phone ?? null,
      website: entrepreneur.website ?? null,
      category: entrepreneur.category,
      description: entrepreneur.description,
      location: entrepreneur.location,
      address: entrepreneur.address ?? null,
      city: entrepreneur.city,
      lat: entrepreneur.lat,
      lng: entrepreneur.lng,
      openingHours: entrepreneur.openingHours ?? null,
      logoUrl: entrepreneur.logoUrl ?? null,
      image: entrepreneur.image ?? null,
      isVerified: entrepreneur.isVerified ?? false,
      createdAt: new Date(),
    };
    this.entrepreneurs.set(id, newEntrepreneur);
    return newEntrepreneur;
  }

  async updateEntrepreneur(id: string, entrepreneur: Partial<InsertEntrepreneur>): Promise<Entrepreneur | undefined> {
    const existing = this.entrepreneurs.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...entrepreneur };
    this.entrepreneurs.set(id, updated);
    return updated;
  }

  async deleteEntrepreneur(id: string): Promise<boolean> {
    return this.entrepreneurs.delete(id);
  }

  async getProposals(status?: string): Promise<Proposal[]> {
    let results = Array.from(this.proposals.values());

    if (status) {
      results = results.filter((p) => p.status === status);
    }

    return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getProposal(id: string): Promise<Proposal | undefined> {
    return this.proposals.get(id);
  }

  async createProposal(proposal: InsertProposal): Promise<Proposal> {
    const id = randomUUID();
    const newProposal: Proposal = {
      ...proposal,
      id,
      votesFor: "0",
      votesAgainst: "0",
      votesAbstain: "0",
      status: "active",
      createdAt: new Date(),
    };
    this.proposals.set(id, newProposal);
    return newProposal;
  }

  async voteOnProposal(id: string, voteType: "for" | "against" | "abstain"): Promise<Proposal | undefined> {
    const proposal = this.proposals.get(id);
    if (!proposal) return undefined;

    const updated = { ...proposal };
    const forVotes = parseInt(updated.votesFor) || 0;
    const againstVotes = parseInt(updated.votesAgainst) || 0;
    const abstainVotes = parseInt(updated.votesAbstain) || 0;

    if (voteType === "for") {
      updated.votesFor = String(forVotes + 1);
    } else if (voteType === "against") {
      updated.votesAgainst = String(againstVotes + 1);
    } else {
      updated.votesAbstain = String(abstainVotes + 1);
    }

    this.proposals.set(id, updated);
    return updated;
  }

  async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    const results = Array.from(this.activities.values());
    return results
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = randomUUID();
    const newActivity: Activity = {
      ...activity,
      id,
      entrepreneurId: activity.entrepreneurId ?? null,
      createdAt: new Date(),
    };
    this.activities.set(id, newActivity);
    return newActivity;
  }

  async getChatRooms(): Promise<ChatRoom[]> {
    return Array.from(this.chatRooms.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getChatRoom(id: string): Promise<ChatRoom | undefined> {
    return this.chatRooms.get(id);
  }

  async createChatRoom(room: InsertChatRoom): Promise<ChatRoom> {
    const id = randomUUID();
    const newRoom: ChatRoom = {
      id,
      name: room.name,
      description: room.description ?? null,
      category: room.category ?? null,
      createdBy: room.createdBy,
      createdAt: new Date(),
    };
    this.chatRooms.set(id, newRoom);
    return newRoom;
  }

  async getChatMessages(roomId: string, limit: number = 100): Promise<ChatMessage[]> {
    const messages = Array.from(this.chatMessages.values()).filter(
      (m) => m.roomId === roomId
    );
    return messages
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .slice(-limit);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    // Validate required fields
    if (!message.roomId?.trim() || !message.userId?.trim() || !message.userName?.trim() || !message.message?.trim()) {
      throw new Error("Missing required chat message fields");
    }
    
    // Verify room exists
    const room = await this.getChatRoom(message.roomId);
    if (!room) {
      throw new Error("Chat room not found");
    }
    
    const id = randomUUID();
    const newMessage: ChatMessage = {
      id,
      roomId: message.roomId,
      userId: message.userId,
      userName: message.userName,
      message: message.message,
      createdAt: new Date(),
    };
    this.chatMessages.set(id, newMessage);
    return newMessage;
  }

  async getStats() {
    return {
      totalMembers: this.entrepreneurs.size + 2800,
      totalCollaborations: 1234,
      totalRegions: 23,
      monthlyGrowth: 18,
    };
  }
}

class DbStorage implements IStorage {
  async getEntrepreneurs(search?: string, category?: string, lat?: number, lng?: number, radius?: number): Promise<Entrepreneur[]> {
    let conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(entrepreneurs.name, `%${search}%`),
          ilike(entrepreneurs.description, `%${search}%`),
          ilike(entrepreneurs.location, `%${search}%`)
        )
      );
    }
    if (category) {
      conditions.push(eq(entrepreneurs.category, category));
    }

    // Filter out rows with null coordinates first
    if (lat !== undefined && lng !== undefined && radius !== undefined) {
      conditions.push(sql`${entrepreneurs.lat} IS NOT NULL AND ${entrepreneurs.lng} IS NOT NULL`);
    }

    let results: Entrepreneur[];
    if (conditions.length > 0) {
      results = await db
        .select()
        .from(entrepreneurs)
        .where(sql`${sql.join(conditions, sql` AND `)}`)
        .orderBy(desc(entrepreneurs.createdAt));
    } else {
      results = await db.select().from(entrepreneurs).orderBy(desc(entrepreneurs.createdAt));
    }

    // Apply geo filtering with Haversine in code (simpler than complex SQL for MVP)
    if (lat !== undefined && lng !== undefined && radius !== undefined) {
      const maxRadius = Math.min(Math.max(radius, 0), 100); // Clamp radius between 0-100 km
      results = results.filter((e) => {
        if (e.lat == null || e.lng == null || !Number.isFinite(e.lat) || !Number.isFinite(e.lng)) return false;
        const distance = calculateDistance(lat, lng, e.lat, e.lng);
        return distance <= maxRadius;
      });
    }

    return results;
  }

  async getEntrepreneur(id: string): Promise<Entrepreneur | undefined> {
    const result = await db.select().from(entrepreneurs).where(eq(entrepreneurs.id, id)).limit(1);
    return result[0];
  }

  async createEntrepreneur(entrepreneur: StrictInsertEntrepreneur): Promise<Entrepreneur> {
    const result = await db.insert(entrepreneurs).values(entrepreneur).returning();
    return result[0];
  }

  async updateEntrepreneur(id: string, entrepreneur: Partial<InsertEntrepreneur>): Promise<Entrepreneur | undefined> {
    const result = await db.update(entrepreneurs).set(entrepreneur).where(eq(entrepreneurs.id, id)).returning();
    return result[0];
  }

  async deleteEntrepreneur(id: string): Promise<boolean> {
    const result = await db.delete(entrepreneurs).where(eq(entrepreneurs.id, id));
    return result.rowCount! > 0;
  }

  async getProposals(status?: string): Promise<Proposal[]> {
    if (status) {
      return await db
        .select()
        .from(proposals)
        .where(eq(proposals.status, status))
        .orderBy(desc(proposals.createdAt));
    }

    return await db.select().from(proposals).orderBy(desc(proposals.createdAt));
  }

  async getProposal(id: string): Promise<Proposal | undefined> {
    const result = await db.select().from(proposals).where(eq(proposals.id, id)).limit(1);
    return result[0];
  }

  async createProposal(proposal: InsertProposal): Promise<Proposal> {
    const result = await db.insert(proposals).values(proposal).returning();
    return result[0];
  }

  async voteOnProposal(id: string, voteType: "for" | "against" | "abstain"): Promise<Proposal | undefined> {
    const proposal = await this.getProposal(id);
    if (!proposal) return undefined;

    const updates: Partial<Proposal> = {};
    if (voteType === "for") {
      updates.votesFor = String(Number(proposal.votesFor) + 1);
    } else if (voteType === "against") {
      updates.votesAgainst = String(Number(proposal.votesAgainst) + 1);
    } else {
      updates.votesAbstain = String(Number(proposal.votesAbstain) + 1);
    }

    const result = await db.update(proposals).set(updates).where(eq(proposals.id, id)).returning();
    return result[0];
  }

  async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    return db.select().from(activities).orderBy(desc(activities.createdAt)).limit(limit);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const result = await db.insert(activities).values(activity).returning();
    return result[0];
  }

  async getChatRooms(): Promise<ChatRoom[]> {
    return await db.select().from(chatRooms).orderBy(desc(chatRooms.createdAt));
  }

  async getChatRoom(id: string): Promise<ChatRoom | undefined> {
    const result = await db.select().from(chatRooms).where(eq(chatRooms.id, id)).limit(1);
    return result[0];
  }

  async createChatRoom(room: InsertChatRoom): Promise<ChatRoom> {
    const result = await db.insert(chatRooms).values(room).returning();
    return result[0];
  }

  async getChatMessages(roomId: string, limit: number = 100): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.roomId, roomId))
      .orderBy(chatMessages.createdAt)
      .limit(limit);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    // Validate required fields
    if (!message.roomId?.trim() || !message.userId?.trim() || !message.userName?.trim() || !message.message?.trim()) {
      throw new Error("Missing required chat message fields");
    }
    
    // Verify room exists
    const room = await this.getChatRoom(message.roomId);
    if (!room) {
      throw new Error("Chat room not found");
    }
    
    const result = await db.insert(chatMessages).values(message).returning();
    return result[0];
  }

  async getStats() {
    const [totalMembers] = await db.select({ count: sql<number>`count(*)` }).from(entrepreneurs);

    return {
      totalMembers: Number(totalMembers.count) + 2800,
      totalCollaborations: 1234,
      totalRegions: 23,
      monthlyGrowth: 18,
    };
  }
}

export const storage = new MemStorage();
