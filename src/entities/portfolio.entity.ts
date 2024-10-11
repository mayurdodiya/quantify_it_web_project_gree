import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";

@Entity("portfolio")
export class Portfolio {
  toObject() {
    throw new Error("Method not implemented.");
  }
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false })
  type: string;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  sub_title: string;

  @Column({ default: null })
  img_url: string;
  
  @Column({ default: null })
  live_url: string;

  @Column({ type: "jsonb", default: null })
  description: string;

  @CreateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt: Date;

  @DeleteDateColumn({ default: null, type: "timestamptz" })
  deletedAt: Date;
}
