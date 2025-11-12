import { AppDataSource } from "../config/data-source";
import { User, UserRole } from "../entities/user.entity";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export class AuthService {
  private userRepo = AppDataSource.getRepository(User);

  async register(email: string, password: string, role: UserRole) {
    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) throw new Error("User already exists");

    const hashed = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({ email, password: hashed, role });
    await this.userRepo.save(user);
    return user;
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new Error("Invalid credentials");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Invalid credentials");

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    return { user, token };
  }
}
