import {
  type Entrepreneur,
  type InsertEntrepreneur,
  type Proposal,
  type InsertProposal,
  type Activity,
  type InsertActivity,
  entrepreneurs,
  proposals,
  activities,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "db";
import { eq, ilike, or, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Entrepreneurs
  getEntrepreneurs(search?: string, category?: string): Promise<Entrepreneur[]>;
  getEntrepreneur(id: string): Promise<Entrepreneur | undefined>;
  createEntrepreneur(entrepreneur: InsertEntrepreneur): Promise<Entrepreneur>;
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

  constructor() {
    this.entrepreneurs = new Map();
    this.proposals = new Map();
    this.activities = new Map();
    this.seedData();
  }

  private seedData() {
    const sampleEntrepreneurs: InsertEntrepreneur[] = [
      {
        name: "Bakkerij De Gouden Korrel",
        owner: "Maria van den Berg",
        email: "maria@goudenkorre.nl",
        phone: "+31 20 123 4567",
        website: "https://goudenkorre.nl",
        category: "Bakkerij",
        description: "Ambachtelijke bakkerij met verse broodjes en gebak, elke dag vers gebakken met lokale ingrediënten.",
        location: "Amsterdam",
        city: "Amsterdam",
      },
      {
        name: "Koffie & Co",
        owner: "Jan Pieters",
        email: "jan@koffieco.nl",
        phone: "+31 20 234 5678",
        website: "https://koffieco.nl",
        category: "Horeca",
        description: "Gezellig koffiehuis met specialty coffee en verse lunch.",
        location: "Amsterdam",
        city: "Amsterdam",
      },
      {
        name: "Groen Advies",
        owner: "Sophie de Vries",
        email: "sophie@groenadvies.nl",
        phone: "+31 20 345 6789",
        website: "https://groenadvies.nl",
        category: "Consulting",
        description: "Duurzaamheidsadvies voor lokale bedrijven en MKB.",
        location: "Rotterdam",
        city: "Rotterdam",
      },
      {
        name: "Tech Solutions NL",
        owner: "Pieter Jansen",
        email: "pieter@techsolutions.nl",
        phone: "+31 10 456 7890",
        website: "https://techsolutions.nl",
        category: "IT",
        description: "IT support en software development voor lokale bedrijven.",
        location: "Utrecht",
        city: "Utrecht",
      },
      {
        name: "Bloemen & Planten",
        owner: "Lisa Bakker",
        email: "lisa@bloemenplanten.nl",
        phone: "+31 30 567 8901",
        website: "https://bloemenplanten.nl",
        category: "Retail",
        description: "Verse bloemen en planten voor elke gelegenheid.",
        location: "Den Haag",
        city: "Den Haag",
      },
      {
        name: "Fitness First",
        owner: "Mark de Jong",
        email: "mark@fitnessfirst.nl",
        phone: "+31 40 678 9012",
        website: "https://fitnessfirst.nl",
        category: "Sport",
        description: "Modern fitness centrum met personal training.",
        location: "Eindhoven",
        city: "Eindhoven",
      },
    ];

    sampleEntrepreneurs.forEach((e) => {
      const id = randomUUID();
      this.entrepreneurs.set(id, { 
        id,
        name: e.name,
        owner: e.owner,
        email: e.email,
        phone: e.phone ?? null,
        website: e.website ?? null,
        category: e.category,
        description: e.description,
        location: e.location,
        city: e.city,
        lat: null,
        lng: null,
        image: null,
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
  }

  async getEntrepreneurs(search?: string, category?: string): Promise<Entrepreneur[]> {
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

    return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getEntrepreneur(id: string): Promise<Entrepreneur | undefined> {
    return this.entrepreneurs.get(id);
  }

  async createEntrepreneur(entrepreneur: InsertEntrepreneur): Promise<Entrepreneur> {
    const id = randomUUID();
    const newEntrepreneur: Entrepreneur = {
      ...entrepreneur,
      id,
      phone: entrepreneur.phone ?? null,
      lat: entrepreneur.lat ?? null,
      lng: entrepreneur.lng ?? null,
      image: entrepreneur.image ?? null,
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
  async getEntrepreneurs(search?: string, category?: string): Promise<Entrepreneur[]> {
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

    if (conditions.length > 0) {
      return await db
        .select()
        .from(entrepreneurs)
        .where(sql`${sql.join(conditions, sql` AND `)}`)
        .orderBy(desc(entrepreneurs.createdAt));
    }

    return await db.select().from(entrepreneurs).orderBy(desc(entrepreneurs.createdAt));
  }

  async getEntrepreneur(id: string): Promise<Entrepreneur | undefined> {
    const result = await db.select().from(entrepreneurs).where(eq(entrepreneurs.id, id)).limit(1);
    return result[0];
  }

  async createEntrepreneur(entrepreneur: InsertEntrepreneur): Promise<Entrepreneur> {
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
