import { Role } from 'src/api/role/entities/role.entity'
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn
} from 'typeorm'

@Entity()
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column()
  username: string

  @Column({
    select: false
  })
  password: string

  @Column()
  email: string

  @Column()
  avatar_url: string

  @Column()
  status: boolean

  @Column()
  ip: string

  @Column()
  address: string

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @OneToOne(() => Role, (role) => role.user)
  @JoinColumn({
    name: 'role_id'
  })
  role: Role
}
