import { Status } from "../utils/enum";
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";

@Entity("featured_services")
export class FeaturedServices {
  toObject() {
    throw new Error("Method not implemented.");
  }
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({ type: "jsonb", default: null })
  description: string;

  @Column({ default: null })
  logo_img_url: string;

  @Column({ default: Status.ACTIVE })
  status: Status;

  @CreateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  creadtedAt: Date;

  @UpdateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt: Date;

  @DeleteDateColumn({ default: null, type: "timestamptz" })
  deletedAt: Date;
}
