import { Status } from "../utils/enum";
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { WhoWeAre } from "./who_we_are.entity";

@Entity("certification_details")
export class CertificationDetails {
  toObject() {
    throw new Error("Method not implemented.");
  }
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false })
  sub_title: string;

  @Column({ type: "jsonb", nullable: false })
  sub_description: string;

  @Column({ nullable: false })
  logo_img_url: string;

  @Column({ default: Status.ACTIVE })
  status: Status;

  @CreateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt: Date;

  @DeleteDateColumn({ default: null, type: "timestamptz" })
  deletedAt: Date;

  // relation
  @ManyToOne(() => WhoWeAre, (who_we_are) => who_we_are.certification_details)
  @JoinColumn({ name: "who_we_are_id" })
  who_we_are: WhoWeAre;
}
