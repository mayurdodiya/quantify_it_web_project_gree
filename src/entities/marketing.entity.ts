import { BussinessStage, MarketingType } from "../utils/enum";
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";

@Entity("marketing")
export class Marketing {
  toObject() {
    throw new Error("Method not implemented.");
  }
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false, default: MarketingType.BRAND })
  marketing_type: MarketingType;

  @Column({ nullable: false })
  referred_by: boolean;

  @Column({ nullable: false, default: BussinessStage.STARTUP })
  business_stage: BussinessStage;

  @Column({ nullable: false })
  full_name: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  location: string;

  @Column({ nullable: false })
  company_name: string;

  @Column({ nullable: false })
  user_message: string;

  @CreateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt: Date;

  @DeleteDateColumn({ default: null, type: "timestamptz" })
  deletedAt: Date;
}
