import type { Access, CollectionBeforeChangeHook, CollectionConfig } from "payload";

import { isOwner, ownerOnly } from "../access/roles";

const ownerOrSelf: Access = ({ req }) => {
  if (isOwner(req.user)) return true;
  if (!req.user) return false;
  return { id: { equals: req.user.id } };
};

const promoteFirstUserToOwner: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation !== "create") return data;
  const { totalDocs } = await req.payload.count({
    collection: "users",
    overrideAccess: true,
    req,
  });
  if (totalDocs === 0) {
    return { ...data, role: "owner" };
  }
  return data;
};

export const Users: CollectionConfig = {
  slug: "users",
  auth: { useAPIKey: true },
  access: {
    admin: ({ req }) => isOwner(req.user),
    read: ownerOrSelf,
    create: ownerOnly,
    update: ownerOnly,
    delete: ownerOnly,
    unlock: ownerOnly,
  },
  hooks: {
    beforeChange: [promoteFirstUserToOwner],
  },
  fields: [
    {
      name: "role",
      type: "select",
      required: true,
      // Function default avoids a static SQL DEFAULT that triggers Drizzle's
      // SQLite table-rebuild loop on boot.
      defaultValue: () => "agent",
      saveToJWT: true,
      options: [
        { label: "Owner", value: "owner" },
        { label: "Agent", value: "agent" },
      ],
      access: {
        update: ({ req }) => isOwner(req.user),
      },
    },
  ],
};
