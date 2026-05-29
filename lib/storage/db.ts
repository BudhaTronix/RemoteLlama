import { openDB, type DBSchema, type IDBPDatabase } from "idb";

import type { AttachmentRecord, ChatSession } from "@/types/app";

const DB_NAME = "ollabridge";
const DB_VERSION = 1;
const SESSION_STORE = "sessions";

interface OllaBridgeDb extends DBSchema {
  sessions: {
    key: string;
    value: ChatSession;
    indexes: {
      updatedAt: string;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<OllaBridgeDb>> | null = null;

function hydrateAttachment(attachment: AttachmentRecord) {
  if (attachment.kind === "image" && attachment.base64Data && !attachment.previewUrl) {
    return {
      ...attachment,
      previewUrl: `data:${attachment.mimeType};base64,${attachment.base64Data}`,
    };
  }

  return attachment;
}

function hydrateSession(session: ChatSession) {
  return {
    ...session,
    messages: session.messages.map((message) => ({
      ...message,
      attachments: message.attachments?.map(hydrateAttachment),
    })),
  };
}

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<OllaBridgeDb>(DB_NAME, DB_VERSION, {
      upgrade(database) {
        const store = database.createObjectStore(SESSION_STORE, {
          keyPath: "id",
        });
        store.createIndex("updatedAt", "updatedAt");
      },
    });
  }

  return dbPromise;
}

export async function listSessions() {
  const database = await getDb();
  const sessions = await database.getAll(SESSION_STORE);

  return sessions
    .map(hydrateSession)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export async function saveSession(session: ChatSession) {
  const database = await getDb();
  await database.put(SESSION_STORE, session);
}

export async function deleteSession(sessionId: string) {
  const database = await getDb();
  await database.delete(SESSION_STORE, sessionId);
}

export async function getSession(sessionId: string) {
  const database = await getDb();
  const session = await database.get(SESSION_STORE, sessionId);
  return session ? hydrateSession(session) : null;
}
