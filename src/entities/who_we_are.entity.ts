import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";

@Entity("who_we_are")
export class WhoWeAre {
  toObject() {
    throw new Error("Method not implemented.");
  }
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false })
  title: string;

  @Column({ type: "jsonb", nullable: false })
  description: string[];

  @Column({ nullable: false })
  who_we_are_img_url_1: string;

  @Column({ nullable: false })
  who_we_are_img_url_2: string;

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

  @UpdateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt: Date;

  @DeleteDateColumn({ default: null, type: "timestamptz" })
  deletedAt: Date;
}
