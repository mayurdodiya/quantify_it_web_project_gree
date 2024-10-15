import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { PortfolioType } from "./portfolio_type.entity";

@Entity("portfolio")
export class Portfolio {
  toObject() {
    throw new Error("Method not implemented.");
  }
  @PrimaryGeneratedColumn("uuid")
  id: string;

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

  //relation
  @ManyToOne(() => PortfolioType, (portfolio_type) => portfolio_type.portfolio)
  @JoinColumn({ name: "portfolio_type_id" })
  portfolio_type: PortfolioType;
}
