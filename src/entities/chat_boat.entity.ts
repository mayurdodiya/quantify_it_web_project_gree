import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";

@Entity("chat_boat")
export class ChatBoat {
  toObject() {
    throw new Error("Method not implemented.");
  }
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false })
  chat_id: string;

  @Column({ nullable: false })
  sender_id: string;

  @Column({ nullable: false })
  receiver_id: string;

  @Column({ type: "jsonb", default: null })
  message: string;

  @CreateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt: Date;

  @DeleteDateColumn({ default: null, type: "timestamptz" })
  deletedAt: Date;
}
