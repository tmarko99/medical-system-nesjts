/* eslint-disable prettier/prettier */
import { Exclude } from 'class-transformer';
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from './role.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  @Exclude()
  password: string;

  @ManyToMany(() => Role, { cascade: true })
  @JoinTable({
    name: 'users_roles',
    joinColumn: {
        name: 'user_id',
        referencedColumnName: 'id'
    },
    inverseJoinColumn: {
        name: 'role_id',
        referencedColumnName: 'id'
    }
  })
  roles: Role[];
}
