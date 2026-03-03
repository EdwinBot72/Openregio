import {
  type Entrepreneur,
  type InsertEntrepreneur,
  type StrictInsertEntrepreneur,
  type Proposal,
  type InsertProposal,
  type Vote,
  type InsertVote,
  type Activity,
  type InsertActivity,
  type ChatRoom,
  type InsertChatRoom,
  type ChatMessage,
  type InsertChatMessage,
  type Post,
  type InsertPost,
  type UserProfile,
  type InsertUserProfile,
  type Subscription,
  type InsertSubscription,
  type OnboardingToken,
  type InsertOnboardingToken,
  type Document,
  type InsertDocument,
  type ProposalSummary,
  type User,
  type UpsertUser,
  type Bedrijfsprofiel,
  type InsertBedrijfsprofiel,
  type FieldVisibility,
  type InsertFieldVisibility,
  type ConsentLog,
  type InsertConsentLog,
  type VisibilityLevel,
  type WooDossier,
  type InsertWooDossier,
  type CrewProfile,
  type InsertCrewProfile,
  type CrewRequest,
  type InsertCrewRequest,
  type CrewApplication,
  type InsertCrewApplication,
  type Blog,
  type InsertBlog,
  type Commission,
  type InsertCommission,
  entrepreneurs,
  proposals,
  votes,
  activities,
  chatRooms,
  chatMessages,
  posts,
  userProfiles,
  subscriptions,
  onboardingTokens,
  documents,
  users,
  bedrijfsprofielen,
  fieldVisibility,
  consentLog,
  regions,
  authorities,
  wooDossiers,
  crewProfiles,
  crewRequests,
  crewApplications,
  blogs,
  wooCategories,
  commissions,
  type MonitorItem,
  type InsertMonitorItem,
  monitorItems,
  type RegioDeal,
  type InsertRegioDeal,
  regioDeals,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "db";
import { eq, ilike, or, desc, sql, and, inArray } from "drizzle-orm";

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
  // User operations (supports both Replit Auth and email/password)
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUser(user: { email: string; passwordHash: string; plan?: "basic" | "pro"; role?: "member" | "master" | "admin"; firstName?: string | null; lastName?: string | null; mustCompleteOnboarding?: boolean; onboardingToken?: string | null; referralCode?: string | null; referredByUserId?: string | null; referredAt?: Date | null }): Promise<User>;
  updateUserPlan(userId: string, plan: "basic" | "pro"): Promise<User | undefined>;
  updateUserPassword(userId: string, passwordHash: string): Promise<User | undefined>;
  getUserProfileByReplitUserId(replitUserId: string): Promise<UserProfile | undefined>;
  
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
  updateProposalStatus(id: string, status: "open" | "closed"): Promise<Proposal | undefined>;
  getProposalSummaries(userId: string): Promise<ProposalSummary[]>;

  // Votes
  getVotes(proposalId: string): Promise<Vote[]>;
  getUserVote(proposalId: string, userId: string): Promise<Vote | undefined>;
  createVote(vote: InsertVote): Promise<Vote>;
  getVoteCounts(proposalId: string): Promise<{ yes: number; no: number; abstain: number }>;

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

  // Posts
  getPosts(region?: string, type?: string): Promise<Post[]>;
  getPostById(id: string): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  deletePost(id: string): Promise<boolean>;

  // User Profiles
  getUserProfile(id: string): Promise<UserProfile | undefined>;
  getUserProfileByEmail(email: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(id: string, profile: Partial<InsertUserProfile>): Promise<UserProfile | undefined>;

  // Subscriptions
  getSubscription(userId: string): Promise<Subscription | undefined>;
  getSubscriptionById(id: string): Promise<Subscription | undefined>;
  getSubscriptionByMolliePaymentId(molliePaymentId: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: string, subscription: Partial<InsertSubscription>): Promise<Subscription | undefined>;
  cancelSubscription(id: string): Promise<Subscription | undefined>;

  // Onboarding Tokens
  createOnboardingToken(token: InsertOnboardingToken): Promise<OnboardingToken>;
  getOnboardingTokenByToken(token: string): Promise<OnboardingToken | undefined>;
  deleteOnboardingToken(token: string): Promise<boolean>;
  deleteOnboardingTokensByUserId(userId: string): Promise<boolean>;

  // Bedrijfsprofielen (Business Profiles)
  getBedrijfsprofielByUserId(userId: string): Promise<Bedrijfsprofiel | undefined>;
  getAllBedrijfsprofielen(): Promise<Bedrijfsprofiel[]>;
  getBedrijfsprofielenByRegion(region: string): Promise<Bedrijfsprofiel[]>;
  getRegionMemberStats(region: string): Promise<{ count: number; latestMember: Bedrijfsprofiel | null }>;
  getRegionPostStats(region: string, userId: string): Promise<{ openPosts: number; userPosts: number }>;
  createBedrijfsprofiel(profiel: InsertBedrijfsprofiel): Promise<Bedrijfsprofiel>;
  updateBedrijfsprofiel(id: string, profiel: Partial<InsertBedrijfsprofiel>): Promise<Bedrijfsprofiel | undefined>;

  // Documents
  getUserDocuments(userId: string): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;

  // Stats
  getStats(): Promise<{
    totalMembers: number;
    totalCollaborations: number;
    totalRegions: number;
    monthlyGrowth: number;
  }>;

  // Privacy & Consent (AVG compliance)
  getFieldVisibilities(userId: string): Promise<FieldVisibility[]>;
  getFieldVisibility(userId: string, fieldName: string): Promise<FieldVisibility | undefined>;
  setFieldVisibility(userId: string, fieldName: string, visibility: VisibilityLevel): Promise<FieldVisibility>;
  getConsentLogs(userId: string, limit?: number): Promise<ConsentLog[]>;
  createConsentLog(log: InsertConsentLog): Promise<ConsentLog>;
  softDeleteUser(userId: string): Promise<boolean>;
  exportUserData(userId: string): Promise<{
    profile: User;
    bedrijfsprofiel: Bedrijfsprofiel | null;
    visibility: FieldVisibility[];
    consentLog: ConsentLog[];
  }>;

  // PRO Data & Consent Control
  updateUserVisibilitySettings(userId: string, visibilitySettings: string): Promise<User | undefined>;

  // WOO data
  getWooRegions(): Promise<{ id: number; name: string; slug: string }[]>;
  getWooAuthorities(): Promise<{ id: number; name: string; slug: string }[]>;
  getWooCategories(): Promise<{ slug: string; label: string }[]>;

  // WOO Dossiers
  createWooDossier(dossier: InsertWooDossier): Promise<WooDossier>;
  getWooDossiers(userId: string): Promise<WooDossier[]>;
  getWooDossier(id: number, userId: string): Promise<WooDossier | undefined>;
  updateWooDossier(id: number, userId: string, updates: Partial<InsertWooDossier>): Promise<WooDossier | undefined>;

  // RegioCrew - Flex pool for personnel shortages
  getCrewProfile(userId: string): Promise<CrewProfile | undefined>;
  getCrewProfileById(id: string): Promise<CrewProfile | undefined>;
  getCrewProfiles(region?: string, category?: string): Promise<CrewProfile[]>;
  createCrewProfile(profile: InsertCrewProfile): Promise<CrewProfile>;
  updateCrewProfile(id: string, profile: Partial<InsertCrewProfile>): Promise<CrewProfile | undefined>;
  deleteCrewProfile(id: string): Promise<boolean>;

  getCrewRequests(region?: string, category?: string, status?: string): Promise<CrewRequest[]>;
  getCrewRequestById(id: string): Promise<CrewRequest | undefined>;
  getCrewRequestsByBusiness(businessId: string): Promise<CrewRequest[]>;
  createCrewRequest(request: InsertCrewRequest): Promise<CrewRequest>;
  updateCrewRequest(id: string, request: Partial<InsertCrewRequest>): Promise<CrewRequest | undefined>;
  deleteCrewRequest(id: string): Promise<boolean>;

  getCrewApplications(requestId: string): Promise<CrewApplication[]>;
  getCrewApplicationsByProfile(profileId: string): Promise<CrewApplication[]>;
  createCrewApplication(application: InsertCrewApplication): Promise<CrewApplication>;
  updateCrewApplication(id: string, status: string): Promise<CrewApplication | undefined>;

  // Blogs
  getBlogs(status?: string): Promise<Blog[]>;
  getPublishedBlogs(limit?: number): Promise<Blog[]>;
  getBlogById(id: string): Promise<Blog | undefined>;
  getBlogBySlug(slug: string): Promise<Blog | undefined>;
  createBlog(blog: InsertBlog): Promise<Blog>;
  updateBlog(id: string, blog: Partial<InsertBlog>): Promise<Blog | undefined>;
  deleteBlog(id: string): Promise<boolean>;

  // Affiliate/Referral system
  getUserByReferralCode(code: string): Promise<User | undefined>;
  getActiveReferrals(userId: string): Promise<User[]>;
  getAffiliateStats(userId: string): Promise<{ activeReferrals: number; totalCommission: number; pendingCommission: number; paidCommission: number }>;
  getAllAffiliateStats(): Promise<{ userId: string; email: string; referralCode: string; activeReferrals: number; totalCommission: number; pendingCommission: number; paidCommission: number }[]>;
  
  // Commission tracking
  createCommission(commission: InsertCommission): Promise<Commission>;
  getCommissionsByAffiliateId(affiliateUserId: string): Promise<Commission[]>;
  getCommissionById(id: string): Promise<Commission | undefined>;
  getAllCommissions(): Promise<Commission[]>;
  updateCommissionStatus(id: string, status: "pending" | "approved" | "paid" | "cancelled", paidAt?: Date): Promise<Commission | undefined>;
  getCommissionSummary(affiliateUserId: string): Promise<{ total: number; pending: number; approved: number; paid: number }>;

  // Beleidsmonitor
  getMonitorItems(region?: string): Promise<MonitorItem[]>;
  getMonitorItem(id: string): Promise<MonitorItem | undefined>;
  createMonitorItem(item: InsertMonitorItem): Promise<MonitorItem>;
  deleteMonitorItem(id: string): Promise<boolean>;

  // Regio Deals
  getRegioDeals(onlyActive?: boolean): Promise<RegioDeal[]>;
  createRegioDeal(deal: InsertRegioDeal): Promise<RegioDeal>;
  updateRegioDeal(id: string, updates: Partial<InsertRegioDeal>): Promise<RegioDeal | null>;
  deleteRegioDeal(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private entrepreneurs: Map<string, Entrepreneur>;
  private proposals: Map<string, Proposal>;
  private votesByProposal: Map<string, Map<string, Vote>>;
  private activities: Map<string, Activity>;
  private chatRooms: Map<string, ChatRoom>;
  private chatMessages: Map<string, ChatMessage>;
  private posts: Map<string, Post>;
  private userProfiles: Map<string, UserProfile>;
  private subscriptions: Map<string, Subscription>;
  private onboardingTokens: Map<string, OnboardingToken>;
  private bedrijfsprofielen: Map<string, Bedrijfsprofiel>;
  private documentsList: Map<string, Document>;

  constructor() {
    this.users = new Map();
    this.entrepreneurs = new Map();
    this.proposals = new Map();
    this.votesByProposal = new Map();
    this.activities = new Map();
    this.chatRooms = new Map();
    this.chatMessages = new Map();
    this.posts = new Map();
    this.userProfiles = new Map();
    this.subscriptions = new Map();
    this.onboardingTokens = new Map();
    this.bedrijfsprofielen = new Map();
    this.documentsList = new Map();
    this.seedData();
  }

  // Replit Auth: User operations (IMPORTANT: mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(userData: { email: string; passwordHash: string; plan?: "basic" | "pro"; role?: "member" | "master" | "admin"; firstName?: string | null; lastName?: string | null; mustCompleteOnboarding?: boolean; onboardingToken?: string | null; referralCode?: string | null; referredByUserId?: string | null; referredAt?: Date | null }): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      email: userData.email,
      passwordHash: userData.passwordHash,
      plan: userData.plan || "basic",
      role: userData.role || "member",
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: null,
      businessName: null,
      bio: null,
      category: null,
      region: null,
      visibilitySettings: null,
      mustCompleteOnboarding: userData.mustCompleteOnboarding ?? true,
      onboardingToken: userData.onboardingToken || null,
      referralCode: userData.referralCode || null,
      referredByUserId: userData.referredByUserId || null,
      referredAt: userData.referredAt || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    this.users.set(id, user);
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const id = userData.id || randomUUID();
    const existing = this.users.get(id);
    const user: User = {
      id,
      email: userData.email!,
      passwordHash: userData.passwordHash || null,
      plan: (userData.plan as "basic" | "pro") || "basic",
      role: (userData.role as "member" | "master" | "admin") || existing?.role || "member",
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      businessName: userData.businessName || null,
      bio: userData.bio || null,
      category: userData.category || null,
      region: existing?.region || null,
      visibilitySettings: existing?.visibilitySettings || null,
      mustCompleteOnboarding: userData.mustCompleteOnboarding ?? true,
      onboardingToken: userData.onboardingToken || null,
      referralCode: existing?.referralCode || null,
      referredByUserId: existing?.referredByUserId || null,
      referredAt: existing?.referredAt || null,
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
      deletedAt: existing?.deletedAt || null,
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUserPlan(userId: string, plan: "basic" | "pro"): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) {
      return undefined;
    }
    
    const updatedUser: User = {
      ...user,
      plan,
      updatedAt: new Date(),
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserPassword(userId: string, passwordHash: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) {
      return undefined;
    }
    
    const updatedUser: User = {
      ...user,
      passwordHash,
      updatedAt: new Date(),
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getUserProfileByReplitUserId(replitUserId: string): Promise<UserProfile | undefined> {
    return Array.from(this.userProfiles.values()).find(
      profile => profile.replitUserId === replitUserId
    );
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

    // Seed user profiles matching ownerUserId references
    const sampleUserProfiles: Array<InsertUserProfile & { id: string }> = [
      {
        id: "user-maria",
        name: "Maria van den Berg",
        email: "maria@goudenkorre.nl",
        painPoints: ["visibility", "time"],
        onboardingCompleted: true,
      },
      {
        id: "user-jan",
        name: "Jan de Vries",
        email: "jan@bakkerij.nl",
        painPoints: ["no_community", "digital_stress"],
        onboardingCompleted: true,
      },
      {
        id: "user-sophie",
        name: "Sophie Bakker",
        email: "sophie@bloemen.nl",
        painPoints: ["platform_fees", "rules"],
        onboardingCompleted: true,
      },
      {
        id: "user-pieter",
        name: "Pieter Visser",
        email: "pieter@slager.nl",
        painPoints: ["low_autonomy"],
        onboardingCompleted: false,
      },
      {
        id: "user-lisa",
        name: "Lisa Mulder",
        email: "lisa@yogastudio.nl",
        painPoints: ["visibility", "no_community", "time"],
        onboardingCompleted: true,
      },
      {
        id: "user-mark",
        name: "Mark de Jong",
        email: "mark@fitnessfirst.nl",
        painPoints: [],
        onboardingCompleted: false,
      },
    ];

    sampleUserProfiles.forEach((p) => {
      this.userProfiles.set(p.id, {
        id: p.id,
        replitUserId: null,
        name: p.name,
        email: p.email,
        painPoints: p.painPoints || [],
        onboardingCompleted: p.onboardingCompleted ?? false,
        createdAt: new Date(),
      });
    });

    const sampleProposals: InsertProposal[] = [
      {
        title: "Introductie van groepsaankopen voor leden",
        description: "Voorstel om gezamenlijke inkoop mogelijk te maken voor betere prijzen bij leveranciers.",
        proposerId: "1",
        proposerName: "Maria van den Berg",
        closesAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    ];

    sampleProposals.forEach((p) => {
      const id = randomUUID();
      this.proposals.set(id, {
        ...p,
        id,
        status: "open",
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

    const samplePosts: InsertPost[] = [
      {
        authorUserId: "user-maria",
        type: "vraag",
        title: "Zoek betrouwbare boekhouder in Amsterdam",
        body: "Hoi allemaal! Mijn bakkerij groeit hard en ik ben op zoek naar een lokale boekhouder die ervaring heeft met horeca. Iemand tips?",
        region: "Amsterdam",
      },
      {
        authorUserId: "user-jan",
        type: "aanbieding",
        title: "Gratis fotoshoot voor lokale ondernemers",
        body: "Ik bied 3 gratis fotoshoots aan voor bedrijfsprofielen. Ideaal voor je website of social media. Eerste 3 reacties krijgen de shoot!",
        region: "Rotterdam",
      },
      {
        authorUserId: "user-sophie",
        type: "event",
        title: "Netwerk Borrel Utrecht - 15 maart",
        body: "Kom gezellig netwerken op 15 maart om 18:00 bij Grand Café Lebowski. Drankje en bitterballen op kosten van de organisatie. Aanmelden verplicht!",
        region: "Utrecht",
      },
      {
        authorUserId: "user-peter",
        type: "lead",
        title: "Klant zoekt webdesigner in Den Haag",
        body: "Een contactpersoon van mij zoekt een goede webdesigner voor een complete website redesign. Budget €5000-8000. DM me voor contact.",
        region: "Den Haag",
      },
      {
        authorUserId: "user-lisa",
        type: "update",
        title: "Nieuwe winkel geopend in Leiden centrum!",
        body: "Na 6 maanden voorbereiding is het eindelijk zover - mijn concept store opent volgende week! Kom langs voor de opening op zaterdag 🎉",
        region: "Leiden",
      },
    ];

    samplePosts.forEach((p, idx) => {
      const id = randomUUID();
      this.posts.set(id, {
        id,
        authorUserId: p.authorUserId ?? null,
        type: p.type,
        title: p.title,
        body: p.body,
        region: p.region,
        createdAt: new Date(Date.now() - idx * 12 * 60 * 60 * 1000),
      });
    });
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
      status: "open",
      createdAt: new Date(),
    };
    this.proposals.set(id, newProposal);
    return newProposal;
  }

  async updateProposalStatus(id: string, status: "open" | "closed"): Promise<Proposal | undefined> {
    const proposal = this.proposals.get(id);
    if (!proposal) return undefined;
    const updated = { ...proposal, status };
    this.proposals.set(id, updated);
    return updated;
  }

  async getProposalSummaries(userId: string): Promise<ProposalSummary[]> {
    const allProposals = await this.getProposals();
    
    return Promise.all(allProposals.map(async (proposal) => {
      const [voteCounts, userVote] = await Promise.all([
        this.getVoteCounts(proposal.id),
        this.getUserVote(proposal.id, userId),
      ]);
      
      return {
        proposal,
        voteCounts,
        userVoteChoice: userVote?.choice as "yes" | "no" | "abstain" | undefined,
      };
    }));
  }

  async getVotes(proposalId: string): Promise<Vote[]> {
    const proposalVotes = this.votesByProposal.get(proposalId);
    return proposalVotes ? Array.from(proposalVotes.values()) : [];
  }

  async getUserVote(proposalId: string, userId: string): Promise<Vote | undefined> {
    const proposalVotes = this.votesByProposal.get(proposalId);
    return proposalVotes?.get(userId);
  }

  async createVote(vote: InsertVote): Promise<Vote> {
    // Check proposal status
    const proposal = await this.getProposal(vote.proposalId);
    if (!proposal) {
      throw new Error("Proposal not found");
    }
    if (proposal.status !== "open") {
      throw new Error("Cannot vote on closed proposal");
    }
    
    // Check for duplicate (O(1) now!)
    if (!this.votesByProposal.has(vote.proposalId)) {
      this.votesByProposal.set(vote.proposalId, new Map());
    }
    const proposalVotes = this.votesByProposal.get(vote.proposalId)!;
    
    if (proposalVotes.has(vote.userId)) {
      throw new Error("User has already voted on this proposal");
    }
    
    const newVote: Vote = {
      id: randomUUID(),
      ...vote,
      createdAt: new Date(),
    };
    
    // Store in nested map (single source of truth)
    proposalVotes.set(vote.userId, newVote);
    
    return newVote;
  }

  async getVoteCounts(proposalId: string): Promise<{ yes: number; no: number; abstain: number }> {
    const proposalVotes = await this.getVotes(proposalId);
    return {
      yes: proposalVotes.filter(v => v.choice === "yes").length,
      no: proposalVotes.filter(v => v.choice === "no").length,
      abstain: proposalVotes.filter(v => v.choice === "abstain").length,
    };
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

  async getPosts(region?: string, type?: string): Promise<Post[]> {
    let results = Array.from(this.posts.values());

    if (region) {
      results = results.filter((p) => p.region === region);
    }

    if (type) {
      results = results.filter((p) => p.type === type);
    }

    return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getPostById(id: string): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async createPost(post: InsertPost): Promise<Post> {
    const id = randomUUID();
    const newPost: Post = {
      id,
      authorUserId: post.authorUserId ?? null,
      type: post.type,
      title: post.title,
      body: post.body,
      region: post.region,
      createdAt: new Date(),
    };
    this.posts.set(id, newPost);
    return newPost;
  }

  async deletePost(id: string): Promise<boolean> {
    return this.posts.delete(id);
  }

  async getUserProfile(id: string): Promise<UserProfile | undefined> {
    return this.userProfiles.get(id);
  }

  async getUserProfileByEmail(email: string): Promise<UserProfile | undefined> {
    return Array.from(this.userProfiles.values()).find(p => p.email === email);
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const id = randomUUID();
    const newProfile: UserProfile = {
      id,
      replitUserId: profile.replitUserId ?? null,
      name: profile.name,
      email: profile.email,
      painPoints: profile.painPoints || [],
      onboardingCompleted: profile.onboardingCompleted ?? false,
      createdAt: new Date(),
    };
    this.userProfiles.set(id, newProfile);
    return newProfile;
  }

  async updateUserProfile(id: string, profile: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    const existing = this.userProfiles.get(id);
    if (!existing) return undefined;
    
    // Filter out undefined values to prevent field nulling
    const updates: Partial<UserProfile> = {};
    if (profile.name !== undefined) updates.name = profile.name;
    if (profile.email !== undefined) updates.email = profile.email;
    if (profile.painPoints !== undefined) updates.painPoints = profile.painPoints;
    if (profile.onboardingCompleted !== undefined) updates.onboardingCompleted = profile.onboardingCompleted;
    
    const updated = { ...existing, ...updates };
    this.userProfiles.set(id, updated);
    return updated;
  }

  async getSubscription(userId: string): Promise<Subscription | undefined> {
    return Array.from(this.subscriptions.values()).find(s => s.userId === userId);
  }

  async getSubscriptionById(id: string): Promise<Subscription | undefined> {
    return this.subscriptions.get(id);
  }

  async getSubscriptionByMolliePaymentId(molliePaymentId: string): Promise<Subscription | undefined> {
    return Array.from(this.subscriptions.values()).find(s => s.molliePaymentId === molliePaymentId);
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const id = randomUUID();
    const now = new Date();
    const newSubscription: Subscription = {
      id,
      userId: subscription.userId,
      molliePaymentId: subscription.molliePaymentId ?? null,
      mollieCustomerId: subscription.mollieCustomerId ?? null,
      mollieSubscriptionId: subscription.mollieSubscriptionId ?? null,
      status: subscription.status ?? "active",
      plan: subscription.plan,
      currentPeriodEnd: subscription.currentPeriodEnd ?? null,
      canceledAt: null,
      createdAt: now,
      updatedAt: now,
    };
    this.subscriptions.set(id, newSubscription);
    return newSubscription;
  }

  async updateSubscription(id: string, subscription: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    const existing = this.subscriptions.get(id);
    if (!existing) return undefined;

    const updated: Subscription = {
      ...existing,
      ...(subscription.mollieCustomerId !== undefined && { mollieCustomerId: subscription.mollieCustomerId }),
      ...(subscription.mollieSubscriptionId !== undefined && { mollieSubscriptionId: subscription.mollieSubscriptionId }),
      ...(subscription.status !== undefined && { status: subscription.status }),
      ...(subscription.plan !== undefined && { plan: subscription.plan }),
      ...(subscription.currentPeriodEnd !== undefined && { currentPeriodEnd: subscription.currentPeriodEnd }),
      updatedAt: new Date(),
    };
    this.subscriptions.set(id, updated);
    return updated;
  }

  async cancelSubscription(id: string): Promise<Subscription | undefined> {
    const existing = this.subscriptions.get(id);
    if (!existing) return undefined;

    const updated: Subscription = {
      ...existing,
      status: "cancelled",
      canceledAt: new Date(),
      updatedAt: new Date(),
    };
    this.subscriptions.set(id, updated);
    return updated;
  }

  async createOnboardingToken(token: InsertOnboardingToken): Promise<OnboardingToken> {
    const id = randomUUID();
    const now = new Date();
    const newToken: OnboardingToken = {
      id,
      userId: token.userId,
      token: token.token,
      expiresAt: token.expiresAt,
      createdAt: now,
    };
    this.onboardingTokens.set(token.token, newToken);
    return newToken;
  }

  async getOnboardingTokenByToken(token: string): Promise<OnboardingToken | undefined> {
    return this.onboardingTokens.get(token);
  }

  async deleteOnboardingToken(token: string): Promise<boolean> {
    return this.onboardingTokens.delete(token);
  }

  async deleteOnboardingTokensByUserId(userId: string): Promise<boolean> {
    let deleted = false;
    for (const [key, t] of this.onboardingTokens.entries()) {
      if (t.userId === userId) {
        this.onboardingTokens.delete(key);
        deleted = true;
      }
    }
    return deleted;
  }

  async getBedrijfsprofielByUserId(userId: string): Promise<Bedrijfsprofiel | undefined> {
    return Array.from(this.bedrijfsprofielen.values()).find(p => p.gebruikerId === userId);
  }

  async getAllBedrijfsprofielen(): Promise<Bedrijfsprofiel[]> {
    return Array.from(this.bedrijfsprofielen.values()).filter(p => p.status === "actief");
  }

  async getBedrijfsprofielenByRegion(region: string): Promise<Bedrijfsprofiel[]> {
    return Array.from(this.bedrijfsprofielen.values())
      .filter(p => p.status === "actief" && p.regio === region);
  }

  async getRegionMemberStats(region: string): Promise<{ count: number; latestMember: Bedrijfsprofiel | null }> {
    const members = await this.getBedrijfsprofielenByRegion(region);
    const sorted = members.sort((a, b) => {
      const dateA = a.aangemaakt ? new Date(a.aangemaakt).getTime() : 0;
      const dateB = b.aangemaakt ? new Date(b.aangemaakt).getTime() : 0;
      return dateB - dateA;
    });
    return {
      count: members.length,
      latestMember: sorted[0] || null,
    };
  }

  async getRegionPostStats(region: string, userId: string): Promise<{ openPosts: number; userPosts: number }> {
    const allPosts = Array.from(this.posts.values());
    const regionPosts = allPosts.filter(p => p.region === region);
    const userPosts = allPosts.filter(p => p.authorUserId === userId);
    return {
      openPosts: regionPosts.length,
      userPosts: userPosts.length,
    };
  }

  async createBedrijfsprofiel(profiel: InsertBedrijfsprofiel): Promise<Bedrijfsprofiel> {
    const id = randomUUID();
    const now = new Date();
    const newProfiel: Bedrijfsprofiel = {
      id,
      gebruikerId: profiel.gebruikerId,
      naam: profiel.naam,
      eigenaarnaam: profiel.eigenaarnaam,
      categorieId: profiel.categorieId,
      regio: profiel.regio,
      beschrijving: profiel.beschrijving,
      websiteUrl: profiel.websiteUrl || null,
      stemtoon: profiel.stemtoon || null,
      status: profiel.status || "actief",
      aangemaakt: now,
      bijgewerkt: now,
    };
    this.bedrijfsprofielen.set(id, newProfiel);
    return newProfiel;
  }

  async updateBedrijfsprofiel(id: string, profiel: Partial<InsertBedrijfsprofiel>): Promise<Bedrijfsprofiel | undefined> {
    const existing = this.bedrijfsprofielen.get(id);
    if (!existing) return undefined;

    const updated: Bedrijfsprofiel = {
      ...existing,
      ...profiel,
      bijgewerkt: new Date(),
    };
    this.bedrijfsprofielen.set(id, updated);
    return updated;
  }

  async getUserDocuments(userId: string): Promise<Document[]> {
    return Array.from(this.documentsList.values()).filter(doc => doc.userId === userId);
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const newDoc: Document = {
      id,
      ...document,
      createdAt: new Date(),
    };
    this.documentsList.set(id, newDoc);
    return newDoc;
  }

  async getStats() {
    return {
      totalMembers: this.entrepreneurs.size + 2800,
      totalCollaborations: 1234,
      totalRegions: 23,
      monthlyGrowth: 18,
    };
  }

  // Privacy & Consent (AVG compliance) - MemStorage stubs
  private fieldVisibilities: Map<string, FieldVisibility> = new Map();
  private consentLogs: ConsentLog[] = [];

  async getFieldVisibilities(userId: string): Promise<FieldVisibility[]> {
    return Array.from(this.fieldVisibilities.values()).filter(v => v.userId === userId);
  }

  async getFieldVisibility(userId: string, fieldName: string): Promise<FieldVisibility | undefined> {
    return this.fieldVisibilities.get(`${userId}-${fieldName}`);
  }

  async setFieldVisibility(userId: string, fieldName: string, visibility: VisibilityLevel): Promise<FieldVisibility> {
    const key = `${userId}-${fieldName}`;
    const existing = this.fieldVisibilities.get(key);
    const fv: FieldVisibility = {
      id: existing?.id || randomUUID(),
      userId,
      fieldName,
      visibility
    };
    this.fieldVisibilities.set(key, fv);
    return fv;
  }

  async getConsentLogs(userId: string, limit: number = 10): Promise<ConsentLog[]> {
    return this.consentLogs.filter(l => l.userId === userId).slice(0, limit);
  }

  async createConsentLog(log: InsertConsentLog): Promise<ConsentLog> {
    const cl: ConsentLog = { 
      id: randomUUID(), 
      userId: log.userId,
      fieldName: log.fieldName,
      oldVisibility: log.oldVisibility ?? null,
      newVisibility: log.newVisibility,
      changedAt: new Date() 
    };
    this.consentLogs.push(cl);
    return cl;
  }

  async softDeleteUser(userId: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (user) {
      user.deletedAt = new Date();
      return true;
    }
    return false;
  }

  async exportUserData(userId: string): Promise<{
    profile: User;
    bedrijfsprofiel: Bedrijfsprofiel | null;
    visibility: FieldVisibility[];
    consentLog: ConsentLog[];
  }> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("Gebruiker niet gevonden");
    const profiel = await this.getBedrijfsprofielByUserId(userId);
    return {
      profile: user,
      bedrijfsprofiel: profiel || null,
      visibility: await this.getFieldVisibilities(userId),
      consentLog: await this.getConsentLogs(userId, 100)
    };
  }

  async updateUserVisibilitySettings(userId: string, visibilitySettings: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (user) {
      user.visibilitySettings = visibilitySettings;
      return user;
    }
    return undefined;
  }

  async getWooRegions(): Promise<{ id: number; name: string; slug: string }[]> {
    return [];
  }

  async getWooAuthorities(): Promise<{ id: number; name: string; slug: string }[]> {
    return [];
  }

  async getWooCategories(): Promise<{ slug: string; label: string }[]> {
    return [
      { slug: "mandaat_delegatie", label: "Mandaat & delegatie" },
      { slug: "beleid_verordening", label: "Beleid & verordeningen" },
      { slug: "vergunningen", label: "Vergunningen & beleidsregels" },
      { slug: "heffingen_leges", label: "Heffingen, leges, belastingen" },
      { slug: "handhaving_kaders", label: "Handhavingskaders (beleid)" },
      { slug: "aanbesteding", label: "Aanbestedingen & gunning" },
      { slug: "subsidies", label: "Subsidiekaders & besluiten" },
      { slug: "uitvoering_partijen", label: "Uitvoeringsorganisaties/derden" },
      { slug: "openbaarheid_archief", label: "Archief/openbaarheid/werkinstructies" },
    ];
  }

  async createWooDossier(dossier: InsertWooDossier): Promise<WooDossier> {
    const id = Date.now();
    return {
      id,
      ...dossier,
      status: dossier.status || "draft",
      createdAt: new Date(),
    } as WooDossier;
  }

  async getWooDossiers(userId: string): Promise<WooDossier[]> {
    return [];
  }

  async getWooDossier(id: number, userId: string): Promise<WooDossier | undefined> {
    return undefined;
  }

  async updateWooDossier(id: number, userId: string, updates: Partial<InsertWooDossier>): Promise<WooDossier | undefined> {
    return undefined;
  }

  // RegioCrew stubs for MemStorage
  private crewProfilesList: Map<string, CrewProfile> = new Map();
  private crewRequestsList: Map<string, CrewRequest> = new Map();
  private crewApplicationsList: Map<string, CrewApplication> = new Map();

  async getCrewProfile(userId: string): Promise<CrewProfile | undefined> {
    return Array.from(this.crewProfilesList.values()).find(p => p.userId === userId);
  }
  async getCrewProfileById(id: string): Promise<CrewProfile | undefined> {
    return this.crewProfilesList.get(id);
  }
  async getCrewProfiles(region?: string, category?: string): Promise<CrewProfile[]> {
    return Array.from(this.crewProfilesList.values()).filter(p => p.isActive);
  }
  async createCrewProfile(profile: InsertCrewProfile): Promise<CrewProfile> {
    const id = randomUUID();
    const cp: CrewProfile = { id, ...profile, createdAt: new Date(), updatedAt: new Date() } as CrewProfile;
    this.crewProfilesList.set(id, cp);
    return cp;
  }
  async updateCrewProfile(id: string, profile: Partial<InsertCrewProfile>): Promise<CrewProfile | undefined> {
    const existing = this.crewProfilesList.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...profile, updatedAt: new Date() };
    this.crewProfilesList.set(id, updated);
    return updated;
  }
  async deleteCrewProfile(id: string): Promise<boolean> {
    return this.crewProfilesList.delete(id);
  }
  async getCrewRequests(region?: string, category?: string, status?: string): Promise<CrewRequest[]> {
    return Array.from(this.crewRequestsList.values());
  }
  async getCrewRequestById(id: string): Promise<CrewRequest | undefined> {
    return this.crewRequestsList.get(id);
  }
  async getCrewRequestsByBusiness(businessId: string): Promise<CrewRequest[]> {
    return Array.from(this.crewRequestsList.values()).filter(r => r.businessId === businessId);
  }
  async createCrewRequest(request: InsertCrewRequest): Promise<CrewRequest> {
    const id = randomUUID();
    const cr: CrewRequest = { id, ...request, createdAt: new Date(), updatedAt: new Date() } as CrewRequest;
    this.crewRequestsList.set(id, cr);
    return cr;
  }
  async updateCrewRequest(id: string, request: Partial<InsertCrewRequest>): Promise<CrewRequest | undefined> {
    const existing = this.crewRequestsList.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...request, updatedAt: new Date() };
    this.crewRequestsList.set(id, updated);
    return updated;
  }
  async deleteCrewRequest(id: string): Promise<boolean> {
    return this.crewRequestsList.delete(id);
  }
  async getCrewApplications(requestId: string): Promise<CrewApplication[]> {
    return Array.from(this.crewApplicationsList.values()).filter(a => a.requestId === requestId);
  }
  async getCrewApplicationsByProfile(profileId: string): Promise<CrewApplication[]> {
    return Array.from(this.crewApplicationsList.values()).filter(a => a.crewProfileId === profileId);
  }
  async createCrewApplication(application: InsertCrewApplication): Promise<CrewApplication> {
    const id = randomUUID();
    const ca: CrewApplication = { id, ...application, createdAt: new Date(), updatedAt: new Date() } as CrewApplication;
    this.crewApplicationsList.set(id, ca);
    return ca;
  }
  async updateCrewApplication(id: string, status: string): Promise<CrewApplication | undefined> {
    const existing = this.crewApplicationsList.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, status, updatedAt: new Date() };
    this.crewApplicationsList.set(id, updated);
    return updated;
  }

  // Blogs (MemStorage stub implementations)
  private blogsList: Map<string, Blog> = new Map();

  async getBlogs(status?: string): Promise<Blog[]> {
    const allBlogs = Array.from(this.blogsList.values());
    if (status) return allBlogs.filter(b => b.status === status);
    return allBlogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getPublishedBlogs(limit?: number): Promise<Blog[]> {
    const published = Array.from(this.blogsList.values())
      .filter(b => b.status === "published")
      .sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
    return limit ? published.slice(0, limit) : published;
  }

  async getBlogById(id: string): Promise<Blog | undefined> {
    return this.blogsList.get(id);
  }

  async getBlogBySlug(slug: string): Promise<Blog | undefined> {
    return Array.from(this.blogsList.values()).find(b => b.slug === slug);
  }

  async createBlog(blog: InsertBlog): Promise<Blog> {
    const id = randomUUID();
    const newBlog: Blog = {
      id,
      ...blog,
      status: blog.status || "draft",
      featuredImage: blog.featuredImage || null,
      publishedAt: blog.status === "published" ? new Date() : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.blogsList.set(id, newBlog);
    return newBlog;
  }

  async updateBlog(id: string, blog: Partial<InsertBlog>): Promise<Blog | undefined> {
    const existing = this.blogsList.get(id);
    if (!existing) return undefined;
    const updated: Blog = {
      ...existing,
      ...blog,
      publishedAt: blog.status === "published" && !existing.publishedAt ? new Date() : existing.publishedAt,
      updatedAt: new Date(),
    };
    this.blogsList.set(id, updated);
    return updated;
  }

  async deleteBlog(id: string): Promise<boolean> {
    return this.blogsList.delete(id);
  }

  // Affiliate/Referral system
  async getUserByReferralCode(code: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.referralCode === code);
  }

  async getActiveReferrals(userId: string): Promise<User[]> {
    // Get all users referred by this user who have active subscriptions
    const referredUsers = Array.from(this.users.values()).filter(u => 
      u.referredByUserId === userId && !u.deletedAt
    );
    // Filter to only active subscriptions
    return referredUsers.filter(u => {
      const sub = Array.from(this.subscriptions.values()).find(s => s.userId === u.id);
      return sub?.status === "active";
    });
  }

  async getAffiliateStats(userId: string): Promise<{ activeReferrals: number; totalCommission: number; pendingCommission: number; paidCommission: number }> {
    const activeReferrals = await this.getActiveReferrals(userId);
    const userCommissions = await this.getCommissionsByAffiliateId(userId);
    const pendingCommission = userCommissions.filter(c => c.status === "pending" || c.status === "approved").reduce((sum, c) => sum + c.amount, 0);
    const paidCommission = userCommissions.filter(c => c.status === "paid").reduce((sum, c) => sum + c.amount, 0);
    return {
      activeReferrals: activeReferrals.length,
      totalCommission: pendingCommission + paidCommission,
      pendingCommission,
      paidCommission
    };
  }

  async getAllAffiliateStats(): Promise<{ userId: string; email: string; referralCode: string; activeReferrals: number; totalCommission: number; pendingCommission: number; paidCommission: number }[]> {
    const usersWithReferrals = Array.from(this.users.values()).filter(u => u.referralCode);
    const stats = await Promise.all(usersWithReferrals.map(async user => {
      const { activeReferrals, totalCommission, pendingCommission, paidCommission } = await this.getAffiliateStats(user.id);
      return {
        userId: user.id,
        email: user.email,
        referralCode: user.referralCode!,
        activeReferrals,
        totalCommission,
        pendingCommission,
        paidCommission
      };
    }));
    return stats.filter(s => s.activeReferrals > 0 || s.totalCommission > 0);
  }

  // Commission tracking (MemStorage implementation)
  private commissionsMap: Map<string, Commission> = new Map();

  async createCommission(commission: InsertCommission): Promise<Commission> {
    const id = randomUUID();
    const newCommission: Commission = {
      id,
      ...commission,
      status: commission.status || "pending",
      paidAt: commission.paidAt || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.commissionsMap.set(id, newCommission);
    return newCommission;
  }

  async getCommissionsByAffiliateId(affiliateUserId: string): Promise<Commission[]> {
    return Array.from(this.commissionsMap.values()).filter(c => c.affiliateUserId === affiliateUserId);
  }

  async getCommissionById(id: string): Promise<Commission | undefined> {
    return this.commissionsMap.get(id);
  }

  async getAllCommissions(): Promise<Commission[]> {
    return Array.from(this.commissionsMap.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async updateCommissionStatus(id: string, status: "pending" | "approved" | "paid" | "cancelled", paidAt?: Date): Promise<Commission | undefined> {
    const commission = this.commissionsMap.get(id);
    if (!commission) return undefined;
    commission.status = status;
    commission.updatedAt = new Date();
    if (paidAt) commission.paidAt = paidAt;
    if (status === "paid" && !paidAt) commission.paidAt = new Date();
    return commission;
  }

  async getCommissionSummary(affiliateUserId: string): Promise<{ total: number; pending: number; approved: number; paid: number }> {
    const userCommissions = await this.getCommissionsByAffiliateId(affiliateUserId);
    return {
      total: userCommissions.reduce((sum, c) => sum + c.amount, 0),
      pending: userCommissions.filter(c => c.status === "pending").reduce((sum, c) => sum + c.amount, 0),
      approved: userCommissions.filter(c => c.status === "approved").reduce((sum, c) => sum + c.amount, 0),
      paid: userCommissions.filter(c => c.status === "paid").reduce((sum, c) => sum + c.amount, 0),
    };
  }

  async getMonitorItems(region?: string): Promise<MonitorItem[]> {
    return [];
  }
  async getMonitorItem(id: string): Promise<MonitorItem | undefined> {
    return undefined;
  }
  async createMonitorItem(item: InsertMonitorItem): Promise<MonitorItem> {
    return { id: randomUUID(), ...item, createdAt: new Date() } as MonitorItem;
  }
  async deleteMonitorItem(id: string): Promise<boolean> {
    return false;
  }

  async getRegioDeals(onlyActive?: boolean): Promise<RegioDeal[]> {
    return [];
  }
  async createRegioDeal(deal: InsertRegioDeal): Promise<RegioDeal> {
    return { id: randomUUID(), ...deal, createdAt: new Date() } as RegioDeal;
  }
  async updateRegioDeal(id: string, updates: Partial<InsertRegioDeal>): Promise<RegioDeal | null> {
    return null;
  }
  async deleteRegioDeal(id: string): Promise<boolean> {
    return false;
  }
}

class DbStorage implements IStorage {
  // User operations (supports both Replit Auth and email/password)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.getUser(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async createUser(userData: { email: string; passwordHash: string; plan?: "basic" | "pro"; role?: "member" | "master" | "admin"; firstName?: string | null; lastName?: string | null; mustCompleteOnboarding?: boolean; onboardingToken?: string | null; referralCode?: string | null; referredByUserId?: string | null; referredAt?: Date | null }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        email: userData.email,
        passwordHash: userData.passwordHash,
        plan: userData.plan || "basic",
        role: userData.role || "member",
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        businessName: null,
        bio: null,
        category: null,
        mustCompleteOnboarding: userData.mustCompleteOnboarding ?? true,
        onboardingToken: userData.onboardingToken || null,
        referralCode: userData.referralCode || null,
        referredByUserId: userData.referredByUserId || null,
        referredAt: userData.referredAt || null,
      })
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        id: userData.id,
        email: userData.email!,
        passwordHash: userData.passwordHash || null,
        plan: userData.plan || "basic",
        role: userData.role || "member",
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        profileImageUrl: userData.profileImageUrl || null,
        businessName: userData.businessName || null,
        bio: userData.bio || null,
        category: userData.category || null,
        mustCompleteOnboarding: userData.mustCompleteOnboarding ?? true,
        onboardingToken: userData.onboardingToken || null,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email!,
          passwordHash: userData.passwordHash || null,
          plan: userData.plan || "basic",
          role: userData.role || "member",
          firstName: userData.firstName || null,
          lastName: userData.lastName || null,
          profileImageUrl: userData.profileImageUrl || null,
          businessName: userData.businessName || null,
          bio: userData.bio || null,
          category: userData.category || null,
          mustCompleteOnboarding: userData.mustCompleteOnboarding ?? true,
          onboardingToken: userData.onboardingToken || null,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserPlan(userId: string, plan: "basic" | "pro"): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ plan, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserPassword(userId: string, passwordHash: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getUserProfileByReplitUserId(replitUserId: string): Promise<UserProfile | undefined> {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.replitUserId, replitUserId));
    return profile;
  }

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

  async updateProposalStatus(id: string, status: "open" | "closed"): Promise<Proposal | undefined> {
    const updated = await db.update(proposals)
      .set({ status })
      .where(eq(proposals.id, id))
      .returning();
    return updated[0];
  }

  async getProposalSummaries(userId: string): Promise<ProposalSummary[]> {
    const allProposals = await this.getProposals();
    
    if (allProposals.length === 0) {
      return [];
    }
    
    const proposalIds = allProposals.map(p => p.id);
    
    // Batch fetch all votes for all proposals in one query
    const allVotes = await db.select().from(votes)
      .where(inArray(votes.proposalId, proposalIds));
    
    // Group votes by proposal ID
    const votesByProposal = new Map<string, Vote[]>();
    for (const vote of allVotes) {
      if (!votesByProposal.has(vote.proposalId)) {
        votesByProposal.set(vote.proposalId, []);
      }
      votesByProposal.get(vote.proposalId)!.push(vote);
    }
    
    // Compute summaries
    return allProposals.map(proposal => {
      const proposalVotes = votesByProposal.get(proposal.id) || [];
      const voteCounts = {
        yes: proposalVotes.filter(v => v.choice === "yes").length,
        no: proposalVotes.filter(v => v.choice === "no").length,
        abstain: proposalVotes.filter(v => v.choice === "abstain").length,
      };
      const userVote = proposalVotes.find(v => v.userId === userId);
      
      return {
        proposal,
        voteCounts,
        userVoteChoice: userVote?.choice as "yes" | "no" | "abstain" | undefined,
      };
    });
  }

  async getVotes(proposalId: string): Promise<Vote[]> {
    return await db.select().from(votes).where(eq(votes.proposalId, proposalId));
  }

  async getUserVote(proposalId: string, userId: string): Promise<Vote | undefined> {
    const result = await db.select().from(votes)
      .where(and(
        eq(votes.proposalId, proposalId),
        eq(votes.userId, userId)
      ))
      .limit(1);
    return result[0];
  }

  async createVote(vote: InsertVote): Promise<Vote> {
    try {
      // Check proposal status first
      const proposal = await this.getProposal(vote.proposalId);
      if (!proposal) {
        throw new Error("Proposal not found");
      }
      if (proposal.status !== "open") {
        throw new Error("Cannot vote on closed proposal");
      }
      
      // Check for existing vote BEFORE insert to handle gracefully
      const existingVote = await this.getUserVote(vote.proposalId, vote.userId);
      if (existingVote) {
        throw new Error("User has already voted on this proposal");
      }
      
      const newVote = await db.insert(votes).values(vote).returning();
      return newVote[0];
    } catch (error: any) {
      // Still catch unique constraint violations as fallback
      if (error.code === '23505' || error.message?.includes('unique')) {
        throw new Error("User has already voted on this proposal");
      }
      throw error;
    }
  }

  async getVoteCounts(proposalId: string): Promise<{ yes: number; no: number; abstain: number }> {
    const proposalVotes = await this.getVotes(proposalId);
    return {
      yes: proposalVotes.filter(v => v.choice === "yes").length,
      no: proposalVotes.filter(v => v.choice === "no").length,
      abstain: proposalVotes.filter(v => v.choice === "abstain").length,
    };
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

  async getPosts(region?: string, type?: string): Promise<Post[]> {
    let conditions = [];

    if (region) {
      conditions.push(eq(posts.region, region));
    }

    if (type) {
      conditions.push(eq(posts.type, type));
    }

    if (conditions.length > 0) {
      return await db
        .select()
        .from(posts)
        .where(sql`${sql.join(conditions, sql` AND `)}`)
        .orderBy(desc(posts.createdAt));
    }

    return await db.select().from(posts).orderBy(desc(posts.createdAt));
  }

  async getPostById(id: string): Promise<Post | undefined> {
    const results = await db.select().from(posts).where(eq(posts.id, id));
    return results[0];
  }

  async createPost(post: InsertPost): Promise<Post> {
    const result = await db.insert(posts).values(post).returning();
    return result[0];
  }

  async deletePost(id: string): Promise<boolean> {
    const result = await db.delete(posts).where(eq(posts.id, id)).returning();
    return result.length > 0;
  }

  async getUserProfile(id: string): Promise<UserProfile | undefined> {
    const results = await db.select().from(userProfiles).where(eq(userProfiles.id, id));
    return results[0];
  }

  async getUserProfileByEmail(email: string): Promise<UserProfile | undefined> {
    const results = await db.select().from(userProfiles).where(eq(userProfiles.email, email));
    return results[0];
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const results = await db.insert(userProfiles).values(profile).returning();
    return results[0];
  }

  async updateUserProfile(id: string, profile: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    // Filter out undefined values to avoid nulling fields
    const updates: any = {};
    if (profile.name !== undefined) updates.name = profile.name;
    if (profile.email !== undefined) updates.email = profile.email;
    if (profile.painPoints !== undefined) updates.painPoints = profile.painPoints;
    if (profile.onboardingCompleted !== undefined) updates.onboardingCompleted = profile.onboardingCompleted;

    // Early return if no fields to update
    if (Object.keys(updates).length === 0) {
      const results = await db.select().from(userProfiles).where(eq(userProfiles.id, id));
      return results[0];
    }

    const results = await db.update(userProfiles)
      .set(updates)
      .where(eq(userProfiles.id, id))
      .returning();
    return results[0];
  }

  async getSubscription(userId: string): Promise<Subscription | undefined> {
    const results = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
    return results[0];
  }

  async getSubscriptionById(id: string): Promise<Subscription | undefined> {
    const results = await db.select().from(subscriptions).where(eq(subscriptions.id, id));
    return results[0];
  }

  async getSubscriptionByMolliePaymentId(molliePaymentId: string): Promise<Subscription | undefined> {
    const results = await db.select().from(subscriptions).where(eq(subscriptions.molliePaymentId, molliePaymentId));
    return results[0];
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const results = await db.insert(subscriptions).values(subscription).returning();
    return results[0];
  }

  async updateSubscription(id: string, subscription: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    const updates: any = {};
    if (subscription.mollieCustomerId !== undefined) updates.mollieCustomerId = subscription.mollieCustomerId;
    if (subscription.mollieSubscriptionId !== undefined) updates.mollieSubscriptionId = subscription.mollieSubscriptionId;
    if (subscription.status !== undefined) updates.status = subscription.status;
    if (subscription.plan !== undefined) updates.plan = subscription.plan;
    if (subscription.currentPeriodEnd !== undefined) updates.currentPeriodEnd = subscription.currentPeriodEnd;
    updates.updatedAt = new Date();

    if (Object.keys(updates).length === 1) {
      const results = await db.select().from(subscriptions).where(eq(subscriptions.id, id));
      return results[0];
    }

    const results = await db.update(subscriptions)
      .set(updates)
      .where(eq(subscriptions.id, id))
      .returning();
    return results[0];
  }

  async cancelSubscription(id: string): Promise<Subscription | undefined> {
    const results = await db.update(subscriptions)
      .set({ 
        status: "cancelled",
        canceledAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(subscriptions.id, id))
      .returning();
    return results[0];
  }

  async createOnboardingToken(token: InsertOnboardingToken): Promise<OnboardingToken> {
    const results = await db.insert(onboardingTokens).values(token).returning();
    return results[0];
  }

  async getOnboardingTokenByToken(token: string): Promise<OnboardingToken | undefined> {
    const results = await db.select().from(onboardingTokens).where(eq(onboardingTokens.token, token));
    return results[0];
  }

  async deleteOnboardingToken(token: string): Promise<boolean> {
    const results = await db.delete(onboardingTokens).where(eq(onboardingTokens.token, token)).returning();
    return results.length > 0;
  }

  async deleteOnboardingTokensByUserId(userId: string): Promise<boolean> {
    const results = await db.delete(onboardingTokens).where(eq(onboardingTokens.userId, userId)).returning();
    return results.length > 0;
  }

  async getBedrijfsprofielByUserId(userId: string): Promise<Bedrijfsprofiel | undefined> {
    const results = await db.select()
      .from(bedrijfsprofielen)
      .where(eq(bedrijfsprofielen.gebruikerId, userId))
      .limit(1);
    return results[0];
  }

  async getAllBedrijfsprofielen(): Promise<Bedrijfsprofiel[]> {
    return await db.select()
      .from(bedrijfsprofielen)
      .where(eq(bedrijfsprofielen.status, "actief"));
  }

  async getBedrijfsprofielenByRegion(region: string): Promise<Bedrijfsprofiel[]> {
    return await db.select()
      .from(bedrijfsprofielen)
      .where(and(
        eq(bedrijfsprofielen.status, "actief"),
        eq(bedrijfsprofielen.regio, region)
      ));
  }

  async getRegionMemberStats(region: string): Promise<{ count: number; latestMember: Bedrijfsprofiel | null }> {
    const members = await this.getBedrijfsprofielenByRegion(region);
    const sorted = members.sort((a, b) => {
      const dateA = a.aangemaakt ? new Date(a.aangemaakt).getTime() : 0;
      const dateB = b.aangemaakt ? new Date(b.aangemaakt).getTime() : 0;
      return dateB - dateA;
    });
    return {
      count: members.length,
      latestMember: sorted[0] || null,
    };
  }

  async getRegionPostStats(region: string, userId: string): Promise<{ openPosts: number; userPosts: number }> {
    const regionPosts = await db.select()
      .from(posts)
      .where(eq(posts.region, region));
    const userPosts = await db.select()
      .from(posts)
      .where(eq(posts.authorUserId, userId));
    return {
      openPosts: regionPosts.length,
      userPosts: userPosts.length,
    };
  }

  async createBedrijfsprofiel(profiel: InsertBedrijfsprofiel): Promise<Bedrijfsprofiel> {
    const results = await db.insert(bedrijfsprofielen)
      .values(profiel)
      .returning();
    return results[0];
  }

  async updateBedrijfsprofiel(id: string, profiel: Partial<InsertBedrijfsprofiel>): Promise<Bedrijfsprofiel | undefined> {
    const results = await db.update(bedrijfsprofielen)
      .set({ ...profiel, bijgewerkt: new Date() })
      .where(eq(bedrijfsprofielen.id, id))
      .returning();
    return results[0];
  }

  async getUserDocuments(userId: string): Promise<Document[]> {
    return await db.select()
      .from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(desc(documents.createdAt));
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const results = await db.insert(documents)
      .values(document)
      .returning();
    return results[0];
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

  // Privacy & Consent (AVG compliance)
  async getFieldVisibilities(userId: string): Promise<FieldVisibility[]> {
    return await db.select()
      .from(fieldVisibility)
      .where(eq(fieldVisibility.userId, userId));
  }

  async getFieldVisibility(userId: string, fieldName: string): Promise<FieldVisibility | undefined> {
    const results = await db.select()
      .from(fieldVisibility)
      .where(and(
        eq(fieldVisibility.userId, userId),
        eq(fieldVisibility.fieldName, fieldName)
      ));
    return results[0];
  }

  async setFieldVisibility(userId: string, fieldName: string, visibility: VisibilityLevel): Promise<FieldVisibility> {
    // Get current visibility for logging
    const current = await this.getFieldVisibility(userId, fieldName);
    const oldVisibility = current?.visibility as VisibilityLevel | undefined;

    // Upsert the visibility setting
    const results = await db.insert(fieldVisibility)
      .values({ userId, fieldName, visibility })
      .onConflictDoUpdate({
        target: [fieldVisibility.userId, fieldVisibility.fieldName],
        set: { visibility }
      })
      .returning();

    // Log the consent change if visibility changed
    if (oldVisibility !== visibility) {
      await this.createConsentLog({
        userId,
        fieldName,
        oldVisibility: oldVisibility || null,
        newVisibility: visibility
      });
    }

    return results[0];
  }

  async getConsentLogs(userId: string, limit: number = 10): Promise<ConsentLog[]> {
    return await db.select()
      .from(consentLog)
      .where(eq(consentLog.userId, userId))
      .orderBy(desc(consentLog.changedAt))
      .limit(limit);
  }

  async createConsentLog(log: InsertConsentLog): Promise<ConsentLog> {
    const results = await db.insert(consentLog)
      .values(log)
      .returning();
    return results[0];
  }

  async softDeleteUser(userId: string): Promise<boolean> {
    const results = await db.update(users)
      .set({ deletedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return results.length > 0;
  }

  async exportUserData(userId: string): Promise<{
    profile: User;
    bedrijfsprofiel: Bedrijfsprofiel | null;
    visibility: FieldVisibility[];
    consentLog: ConsentLog[];
  }> {
    const [user, profiel, visibilities, logs] = await Promise.all([
      this.getUser(userId),
      this.getBedrijfsprofielByUserId(userId),
      this.getFieldVisibilities(userId),
      this.getConsentLogs(userId, 100)
    ]);

    if (!user) {
      throw new Error("Gebruiker niet gevonden");
    }

    return {
      profile: user,
      bedrijfsprofiel: profiel || null,
      visibility: visibilities,
      consentLog: logs
    };
  }

  async updateUserVisibilitySettings(userId: string, visibilitySettings: string): Promise<User | undefined> {
    const results = await db.update(users)
      .set({ visibilitySettings })
      .where(eq(users.id, userId))
      .returning();
    return results[0];
  }

  async getWooRegions(): Promise<{ id: number; name: string; slug: string }[]> {
    const results = await db.select({
      id: regions.id,
      name: regions.name,
      slug: regions.slug
    }).from(regions).orderBy(regions.name);
    return results;
  }

  async getWooAuthorities(): Promise<{ id: number; name: string; slug: string }[]> {
    const results = await db.select({
      id: authorities.id,
      name: authorities.name,
      slug: authorities.slug
    }).from(authorities).orderBy(authorities.name);
    return results;
  }

  async getWooCategories(): Promise<{ slug: string; label: string }[]> {
    const results = await db.select({
      slug: wooCategories.slug,
      label: wooCategories.label
    }).from(wooCategories)
      .where(eq(wooCategories.isAllowed, true))
      .orderBy(wooCategories.label);
    return results;
  }

  async createWooDossier(dossier: InsertWooDossier): Promise<WooDossier> {
    const [result] = await db.insert(wooDossiers).values(dossier).returning();
    return result;
  }

  async getWooDossiers(userId: string): Promise<WooDossier[]> {
    return await db.select().from(wooDossiers)
      .where(eq(wooDossiers.userId, userId))
      .orderBy(desc(wooDossiers.createdAt));
  }

  async getWooDossier(id: number, userId: string): Promise<WooDossier | undefined> {
    const [result] = await db.select().from(wooDossiers)
      .where(and(eq(wooDossiers.id, id), eq(wooDossiers.userId, userId)));
    return result;
  }

  async updateWooDossier(id: number, userId: string, updates: Partial<InsertWooDossier>): Promise<WooDossier | undefined> {
    const [result] = await db.update(wooDossiers)
      .set(updates)
      .where(and(eq(wooDossiers.id, id), eq(wooDossiers.userId, userId)))
      .returning();
    return result;
  }

  // RegioCrew - Flex pool for personnel shortages
  async getCrewProfile(userId: string): Promise<CrewProfile | undefined> {
    const [result] = await db.select().from(crewProfiles)
      .where(eq(crewProfiles.userId, userId));
    return result;
  }

  async getCrewProfileById(id: string): Promise<CrewProfile | undefined> {
    const [result] = await db.select().from(crewProfiles)
      .where(eq(crewProfiles.id, id));
    return result;
  }

  async getCrewProfiles(region?: string, category?: string): Promise<CrewProfile[]> {
    let query = db.select().from(crewProfiles)
      .where(eq(crewProfiles.isActive, true));
    
    const results = await query.orderBy(desc(crewProfiles.createdAt));
    
    return results.filter(profile => {
      if (region && profile.region !== region) return false;
      if (category && !profile.categories.includes(category)) return false;
      return true;
    });
  }

  async createCrewProfile(profile: InsertCrewProfile): Promise<CrewProfile> {
    const [result] = await db.insert(crewProfiles).values(profile).returning();
    return result;
  }

  async updateCrewProfile(id: string, profile: Partial<InsertCrewProfile>): Promise<CrewProfile | undefined> {
    const [result] = await db.update(crewProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(crewProfiles.id, id))
      .returning();
    return result;
  }

  async deleteCrewProfile(id: string): Promise<boolean> {
    const result = await db.delete(crewProfiles)
      .where(eq(crewProfiles.id, id))
      .returning();
    return result.length > 0;
  }

  async getCrewRequests(region?: string, category?: string, status?: string): Promise<CrewRequest[]> {
    const results = await db.select().from(crewRequests)
      .orderBy(desc(crewRequests.createdAt));
    
    return results.filter(request => {
      if (region && request.region !== region) return false;
      if (category && request.category !== category) return false;
      if (status && request.status !== status) return false;
      return true;
    });
  }

  async getCrewRequestById(id: string): Promise<CrewRequest | undefined> {
    const [result] = await db.select().from(crewRequests)
      .where(eq(crewRequests.id, id));
    return result;
  }

  async getCrewRequestsByBusiness(businessId: string): Promise<CrewRequest[]> {
    return await db.select().from(crewRequests)
      .where(eq(crewRequests.businessId, businessId))
      .orderBy(desc(crewRequests.createdAt));
  }

  async createCrewRequest(request: InsertCrewRequest): Promise<CrewRequest> {
    const [result] = await db.insert(crewRequests).values(request).returning();
    return result;
  }

  async updateCrewRequest(id: string, request: Partial<InsertCrewRequest>): Promise<CrewRequest | undefined> {
    const [result] = await db.update(crewRequests)
      .set({ ...request, updatedAt: new Date() })
      .where(eq(crewRequests.id, id))
      .returning();
    return result;
  }

  async deleteCrewRequest(id: string): Promise<boolean> {
    const result = await db.delete(crewRequests)
      .where(eq(crewRequests.id, id))
      .returning();
    return result.length > 0;
  }

  async getCrewApplications(requestId: string): Promise<CrewApplication[]> {
    return await db.select().from(crewApplications)
      .where(eq(crewApplications.requestId, requestId))
      .orderBy(desc(crewApplications.createdAt));
  }

  async getCrewApplicationsByProfile(profileId: string): Promise<CrewApplication[]> {
    return await db.select().from(crewApplications)
      .where(eq(crewApplications.crewProfileId, profileId))
      .orderBy(desc(crewApplications.createdAt));
  }

  async createCrewApplication(application: InsertCrewApplication): Promise<CrewApplication> {
    const [result] = await db.insert(crewApplications).values(application).returning();
    return result;
  }

  async updateCrewApplication(id: string, status: string): Promise<CrewApplication | undefined> {
    const [result] = await db.update(crewApplications)
      .set({ status, updatedAt: new Date() })
      .where(eq(crewApplications.id, id))
      .returning();
    return result;
  }

  // Blogs
  async getBlogs(status?: string): Promise<Blog[]> {
    if (status) {
      return await db.select().from(blogs)
        .where(sql`${blogs.status} = ${status}`)
        .orderBy(desc(blogs.createdAt));
    }
    return await db.select().from(blogs).orderBy(desc(blogs.createdAt));
  }

  async getPublishedBlogs(limit?: number): Promise<Blog[]> {
    const query = db.select().from(blogs)
      .where(sql`${blogs.status} = 'published'`)
      .orderBy(desc(blogs.publishedAt));
    
    if (limit) {
      return await query.limit(limit);
    }
    return await query;
  }

  async getBlogById(id: string): Promise<Blog | undefined> {
    const [blog] = await db.select().from(blogs).where(eq(blogs.id, id));
    return blog;
  }

  async getBlogBySlug(slug: string): Promise<Blog | undefined> {
    const [blog] = await db.select().from(blogs).where(eq(blogs.slug, slug));
    return blog;
  }

  async createBlog(blog: InsertBlog): Promise<Blog> {
    const [result] = await db.insert(blogs).values({
      ...blog,
      publishedAt: blog.status === "published" ? new Date() : null,
    }).returning();
    return result;
  }

  async updateBlog(id: string, blog: Partial<InsertBlog>): Promise<Blog | undefined> {
    const existing = await this.getBlogById(id);
    if (!existing) return undefined;

    const updateData: Record<string, any> = { ...blog, updatedAt: new Date() };
    
    if (blog.status === "published" && !existing.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const [result] = await db.update(blogs)
      .set(updateData)
      .where(eq(blogs.id, id))
      .returning();
    return result;
  }

  async deleteBlog(id: string): Promise<boolean> {
    const result = await db.delete(blogs).where(eq(blogs.id, id)).returning();
    return result.length > 0;
  }

  // Affiliate/Referral system
  async getUserByReferralCode(code: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.referralCode, code));
    return user;
  }

  async getActiveReferrals(userId: string): Promise<User[]> {
    // Get all users referred by this user who have active subscriptions
    const referredUsers = await db.select()
      .from(users)
      .where(and(
        eq(users.referredByUserId, userId),
        sql`${users.deletedAt} IS NULL`
      ));
    
    // Filter to only active subscriptions
    if (referredUsers.length === 0) return [];
    
    const userIds = referredUsers.map(u => u.id);
    const activeSubscriptions = await db.select()
      .from(subscriptions)
      .where(and(
        inArray(subscriptions.userId, userIds),
        eq(subscriptions.status, "active")
      ));
    
    const activeUserIds = new Set(activeSubscriptions.map(s => s.userId));
    return referredUsers.filter(u => activeUserIds.has(u.id));
  }

  async getAffiliateStats(userId: string): Promise<{ activeReferrals: number; totalCommission: number; pendingCommission: number; paidCommission: number }> {
    const activeReferrals = await this.getActiveReferrals(userId);
    const userCommissions = await this.getCommissionsByAffiliateId(userId);
    const pendingCommission = userCommissions.filter(c => c.status === "pending" || c.status === "approved").reduce((sum, c) => sum + c.amount, 0);
    const paidCommission = userCommissions.filter(c => c.status === "paid").reduce((sum, c) => sum + c.amount, 0);
    return {
      activeReferrals: activeReferrals.length,
      totalCommission: pendingCommission + paidCommission,
      pendingCommission,
      paidCommission
    };
  }

  async getAllAffiliateStats(): Promise<{ userId: string; email: string; referralCode: string; activeReferrals: number; totalCommission: number; pendingCommission: number; paidCommission: number }[]> {
    // Get all users with a referral code
    const usersWithReferrals = await db.select()
      .from(users)
      .where(sql`${users.referralCode} IS NOT NULL`);
    
    const stats = await Promise.all(usersWithReferrals.map(async user => {
      const { activeReferrals, totalCommission, pendingCommission, paidCommission } = await this.getAffiliateStats(user.id);
      return {
        userId: user.id,
        email: user.email,
        referralCode: user.referralCode!,
        activeReferrals,
        totalCommission,
        pendingCommission,
        paidCommission
      };
    }));
    
    return stats.filter(s => s.activeReferrals > 0 || s.totalCommission > 0);
  }

  // Commission tracking (DbStorage implementation)
  async createCommission(commission: InsertCommission): Promise<Commission> {
    const [result] = await db.insert(commissions).values({
      ...commission,
      status: commission.status || "pending",
    }).returning();
    return result;
  }

  async getCommissionsByAffiliateId(affiliateUserId: string): Promise<Commission[]> {
    return await db.select()
      .from(commissions)
      .where(eq(commissions.affiliateUserId, affiliateUserId))
      .orderBy(desc(commissions.createdAt));
  }

  async getCommissionById(id: string): Promise<Commission | undefined> {
    const [result] = await db.select().from(commissions).where(eq(commissions.id, id));
    return result;
  }

  async getAllCommissions(): Promise<Commission[]> {
    return await db.select()
      .from(commissions)
      .orderBy(desc(commissions.createdAt));
  }

  async updateCommissionStatus(id: string, status: "pending" | "approved" | "paid" | "cancelled", paidAt?: Date): Promise<Commission | undefined> {
    const updateData: Record<string, any> = { status, updatedAt: new Date() };
    if (paidAt) updateData.paidAt = paidAt;
    if (status === "paid" && !paidAt) updateData.paidAt = new Date();
    
    const [result] = await db.update(commissions)
      .set(updateData)
      .where(eq(commissions.id, id))
      .returning();
    return result;
  }

  async getCommissionSummary(affiliateUserId: string): Promise<{ total: number; pending: number; approved: number; paid: number }> {
    const userCommissions = await this.getCommissionsByAffiliateId(affiliateUserId);
    return {
      total: userCommissions.reduce((sum, c) => sum + c.amount, 0),
      pending: userCommissions.filter(c => c.status === "pending").reduce((sum, c) => sum + c.amount, 0),
      approved: userCommissions.filter(c => c.status === "approved").reduce((sum, c) => sum + c.amount, 0),
      paid: userCommissions.filter(c => c.status === "paid").reduce((sum, c) => sum + c.amount, 0),
    };
  }

  async getMonitorItems(region?: string): Promise<MonitorItem[]> {
    if (region) {
      return await db.select().from(monitorItems).where(eq(monitorItems.region, region)).orderBy(desc(monitorItems.createdAt));
    }
    return await db.select().from(monitorItems).orderBy(desc(monitorItems.createdAt));
  }

  async getMonitorItem(id: string): Promise<MonitorItem | undefined> {
    const [item] = await db.select().from(monitorItems).where(eq(monitorItems.id, id));
    return item;
  }

  async createMonitorItem(item: InsertMonitorItem): Promise<MonitorItem> {
    const [created] = await db.insert(monitorItems).values(item).returning();
    return created;
  }

  async deleteMonitorItem(id: string): Promise<boolean> {
    const result = await db.delete(monitorItems).where(eq(monitorItems.id, id)).returning();
    return result.length > 0;
  }

  async getRegioDeals(onlyActive?: boolean): Promise<RegioDeal[]> {
    if (onlyActive) {
      return await db.select().from(regioDeals).where(eq(regioDeals.isActive, true)).orderBy(desc(regioDeals.createdAt));
    }
    return await db.select().from(regioDeals).orderBy(desc(regioDeals.createdAt));
  }

  async createRegioDeal(deal: InsertRegioDeal): Promise<RegioDeal> {
    const [created] = await db.insert(regioDeals).values(deal).returning();
    return created;
  }

  async updateRegioDeal(id: string, updates: Partial<InsertRegioDeal>): Promise<RegioDeal | null> {
    const [updated] = await db.update(regioDeals).set(updates).where(eq(regioDeals.id, id)).returning();
    return updated ?? null;
  }

  async deleteRegioDeal(id: string): Promise<boolean> {
    const result = await db.delete(regioDeals).where(eq(regioDeals.id, id)).returning();
    return result.length > 0;
  }
}

// NOTE: Switched to DbStorage for persistent data and testing compatibility
// Use DbStorage instead of MemStorage to persist data to PostgreSQL
export const storage = new DbStorage();
