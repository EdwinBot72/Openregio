// ACL-beleid voor opgeslagen objecten (lokale-schijf backend).
// Het beleid wordt bewaard in het <object>.meta.json bestand.
import { StoredFile, fileExists, readMeta, writeMeta } from "./localFile";

// Het type van de toegangsgroep (flexibel uit te breiden per use-case).
export enum ObjectAccessGroupType {}

export interface ObjectAccessGroup {
  type: ObjectAccessGroupType;
  id: string;
}

export enum ObjectPermission {
  READ = "read",
  WRITE = "write",
}

export interface ObjectAclRule {
  group: ObjectAccessGroup;
  permission: ObjectPermission;
}

// Het ACL-beleid van een object (opgeslagen in de meta van het object).
export interface ObjectAclPolicy {
  owner: string;
  visibility: "public" | "private";
  aclRules?: Array<ObjectAclRule>;
}

function isPermissionAllowed(
  requested: ObjectPermission,
  granted: ObjectPermission,
): boolean {
  if (requested === ObjectPermission.READ) {
    return [ObjectPermission.READ, ObjectPermission.WRITE].includes(granted);
  }
  return granted === ObjectPermission.WRITE;
}

abstract class BaseObjectAccessGroup implements ObjectAccessGroup {
  constructor(
    public readonly type: ObjectAccessGroupType,
    public readonly id: string,
  ) {}
  public abstract hasMember(userId: string): Promise<boolean>;
}

function createObjectAccessGroup(
  group: ObjectAccessGroup,
): BaseObjectAccessGroup {
  switch (group.type) {
    default:
      throw new Error(`Unknown access group type: ${group.type}`);
  }
}

// Zet het ACL-beleid in de object-meta.
export async function setObjectAclPolicy(
  objectFile: StoredFile,
  aclPolicy: ObjectAclPolicy,
): Promise<void> {
  if (!fileExists(objectFile)) {
    throw new Error(`Object not found: ${objectFile.objectName}`);
  }
  const meta = readMeta(objectFile);
  meta.aclPolicy = aclPolicy;
  writeMeta(objectFile, meta);
}

// Haalt het ACL-beleid uit de object-meta.
export async function getObjectAclPolicy(
  objectFile: StoredFile,
): Promise<ObjectAclPolicy | null> {
  const meta = readMeta(objectFile);
  return (meta.aclPolicy as ObjectAclPolicy) ?? null;
}

// Controleert of de gebruiker toegang heeft tot het object.
export async function canAccessObject({
  userId,
  objectFile,
  requestedPermission,
}: {
  userId?: string;
  objectFile: StoredFile;
  requestedPermission: ObjectPermission;
}): Promise<boolean> {
  const aclPolicy = await getObjectAclPolicy(objectFile);
  if (!aclPolicy) {
    return false;
  }

  if (
    aclPolicy.visibility === "public" &&
    requestedPermission === ObjectPermission.READ
  ) {
    return true;
  }

  if (!userId) {
    return false;
  }

  if (aclPolicy.owner === userId) {
    return true;
  }

  for (const rule of aclPolicy.aclRules || []) {
    const accessGroup = createObjectAccessGroup(rule.group);
    if (
      (await accessGroup.hasMember(userId)) &&
      isPermissionAllowed(requestedPermission, rule.permission)
    ) {
      return true;
    }
  }

  return false;
}
