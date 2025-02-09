"use server";

import { Client, Account, Databases, Users } from "node-appwrite";
import { cookies } from "next/headers";

function validateEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value;
}

export async function createSessionClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

  const session = cookies().get("appwrite-session");
  
  console.log("Session:", session);

  if (!session || !session.value) {
    console.warn("No session found in cookies.");
    return { account: new Account(client) }; 
  }

  client.setSession(session.value);

  return {
    account: new Account(client),
  };
}

export async function createAdminClient(): Promise<{
  account: Account;
  database: Databases;
  user: Users;
}> {
  const client = new Client()
    .setEndpoint(validateEnvVar("NEXT_PUBLIC_APPWRITE_ENDPOINT"))
    .setProject(validateEnvVar("NEXT_PUBLIC_APPWRITE_PROJECT"))
    .setKey(validateEnvVar("NEXT_APPWRITE_KEY"));

  return {
    account: new Account(client),
    database: new Databases(client),
    user: new Users(client),
  };
}
