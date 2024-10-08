import { Status } from "../utils/enum";
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";

@Entity("provided_service")
export class ProvidedService {
  toObject() {
    throw new Error("Method not implemented.");
  }

  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column({ nullable: false })
  card_img_url: string;

  @Column({ nullable: false })
  service_type: string;

  @Column({ nullable: false })
  service_name: string;

  @Column({ nullable: false })
  service_name_title: string;

  @Column({ type: "jsonb", nullable: false })
  description: string[];

  @Column({ type: "jsonb", nullable: false })
  service_benifits: string[];

  @Column({ nullable: false })
  work_planning_title: string;

  @Column({ type: "jsonb", nullable: false })
  work_planning_description: string[];

  @Column({ nullable: false })
  work_planning_img_url: string;

  @Column({ nullable: false })
  business_solutions_title: string;

  @Column({ type: "jsonb", nullable: false })
  business_solutions_description: string[];

  @Column({ nullable: false })
  business_solutions_img_url: string;

  @Column({ nullable: false })
  completed_works: string;

  @Column({ type: "float", nullable: false })
  client_ratings: number;

  @Column({ type: "float", nullable: false })
  bussiness_reports_percentage: number;

  @Column({ default: Status.ACTIVE })
  status: Status;

  @CreateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  creadtedAt: Date;

  @UpdateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt: Date;

  @DeleteDateColumn({ default: null, type: "timestamptz" })
  deletedAt: Date;
}
