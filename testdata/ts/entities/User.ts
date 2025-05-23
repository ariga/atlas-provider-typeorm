import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Check,
  Index,
  Unique,
} from "typeorm";
import { Blog } from "./Blog";

export enum UserRole {
  ADMIN = "admin",
  EDITOR = "editor",
  GHOST = "ghost",
}

@Entity()
@Unique(["firstName", "lastName"])
@Check(`"age" > 6`)
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.GHOST,
  })
  role: UserRole;

  @Column()
  @Index("IDX_USER_AGE")
  age: number;

  @OneToMany('Blog', 'user')
  blogs: Blog[];
}
