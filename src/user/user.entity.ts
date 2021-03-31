import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
 
@Entity()
class User {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column()
  public name: string;
 
  @Column({ unique: true })
  public email: string;
 
  @Column()
  public password: string;
}
 
export default User;