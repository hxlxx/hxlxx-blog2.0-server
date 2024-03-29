import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

@Entity()
export class Talk {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column()
  uid: number

  @Column()
  content: string

  @Column({
    default: 0
  })
  comment_count: number

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date
}
