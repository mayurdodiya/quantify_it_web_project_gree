import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToOne, JoinColumn } from "typeorm";
import { User } from "./user.entity";

@Entity("permission")
export class Permission {
  toObject() {
    throw new Error("Method not implemented.");
  }
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ default: false })
  about_us_permission: boolean;

  @Column({ default: false })
  banner_permission: boolean;

  @Column({ default: false })
  blog_permission: boolean;

  @Column({ default: false })
  certification_details_permission: boolean;

  @Column({ default: false })
  chat_boat_permission: boolean;

  @Column({ default: false })
  contact_us_permission: boolean;

  @Column({ default: false })
  core_services_permission: boolean;

  @Column({ default: false })
  employee_details_permission: boolean;

  @Column({ default: false })
  featured_services_permission: boolean;

  @Column({ default: false })
  how_we_work_permission: boolean;

  @Column({ default: false })
  marketing_permission: boolean;

  @Column({ default: false })
  our_contact_details_permission: boolean;

  @Column({ default: false })
  policy_and_terms_permission: boolean;

  @Column({ default: false })
  portfolio_permission: boolean;
  
  @Column({ default: false })
  portfolio_type_permission: boolean;

  @Column({ default: false })
  provided_service_permission: boolean;

  @Column({ default: false })
  question_ans_permission: boolean;

  @Column({ default: false })
  sub_services_permission: boolean;

  @Column({ default: false })
  technological_experties_permission: boolean;

  @Column({ default: false })
  trusted_clients_permission: boolean;

  @Column({ default: false })
  vision_experties_permission: boolean;

  @CreateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt: Date;

  @DeleteDateColumn({ default: null, type: "timestamptz" })
  deletedAt: Date;

  // relation
  @OneToOne(() => User, (user) => user.permission)
  @JoinColumn({name:'sub_admin_id'})
  user: User;
}
