import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";

@Entity("about_us")
export class AboutUs {
  toObject() {
    throw new Error("Method not implemented.");
  }
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({ type: "jsonb", nullable: false })
  description: string;

  @Column({ nullable: false })
  who_we_are_img_url_1: string;

  @Column({ nullable: false })
  who_we_are_img_url_2: string;

  @Column({ type: "jsonb", nullable: false })
  our_vision: string;

  @Column({ type: "jsonb", nullable: false })
  our_mission: string;

  @Column({ nullable: false })
  vision_mission_img_url: string;

  @Column({ nullable: false })
  works_about_title: string;

  @Column({ type: "jsonb", nullable: false })
  works_about_description: string;

  @Column({ nullable: false })
  works_about_img_url: string;

  @Column({ nullable: false })
  total_experience: string;

  @Column({ nullable: false })
  talented_it_professionals: string;

  @Column({ nullable: false })
  successfull_projects: string;

  @Column({ nullable: false })
  served_country: string;

  @CreateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @UpdateDateColumn({
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @DeleteDateColumn({ default: null, type: "timestamptz" })
  deletedAt: Date;
}
