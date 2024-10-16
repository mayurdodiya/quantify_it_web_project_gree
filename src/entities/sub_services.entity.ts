import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { CoreServices } from "./core_services.entity";

@Entity("sub_services")
export class SubServices {
  toObject() {
    throw new Error("Method not implemented.");
  }
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // @Column({ nullable: false })
  // core_service_id: string;

  @Column({ nullable: false })
  sub_service_name: string;

  @Column({ nullable: true })
  description_title: string;

  @Column({ nullable: true })
  description_sub_title: string;

  @Column({ type: "jsonb", default: [] })
  description_services: string[];

  @Column({ default: null })
  img_logo_url: string;

  @CreateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt: Date;

  @DeleteDateColumn({ default: null, type: "timestamptz" })
  deletedAt: Date;

  // relation
  @ManyToOne(() => CoreServices, (core_service) => core_service.all_sub_servise)
  @JoinColumn({ name: "core_service_id" })
  core_service: CoreServices;
}
