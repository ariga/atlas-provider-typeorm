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

  @Column()
  @Index("IDX_USER_AGE")
  age: number;

  @OneToMany(() => Blog, (blog) => blog.user)
  blogs: Blog[];
}
