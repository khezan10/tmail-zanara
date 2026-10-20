import type { ObjectId } from "mongodb";

export type DomainDoc = {
  _id?: ObjectId;
  domain: string;
  token: string;
  contact: string;
  status: "pending" | "active";
  createdAt: Date;
  verifiedAt?: Date;
  lastCheckedAt?: Date;
};

export type MessageDoc = {
  _id?: ObjectId;
  address: string;
  domain: string;
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  receivedAt: Date;
};

export type RateDoc = {
  _id: string;
  count: number;
  expireAt: Date;
};
