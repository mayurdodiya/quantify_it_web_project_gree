import { ContactPurpose } from "../utils/enum";
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";

@Entity("contact_us")
export class ContactUs {
  toObject() {
    throw new Error("Method not implemented.");
  }
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false })
  full_name: string;

  @Column({ nullable: false })
  email: string;

  @Column({ type: "jsonb", nullable: false, default: ContactPurpose.OTHERS })
  contact_purpose: ContactPurpose;

  @Column({ nullable: false })
  user_message: string;

  @Column({ nullable: false, default: 0 })
  initial_budget: string;

  @Column({ nullable: false, default: 0 })
  closing_budget: string;

  @CreateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt: Date;

  @DeleteDateColumn({ default: null, type: "timestamptz" })
  deletedAt: Date;
}
