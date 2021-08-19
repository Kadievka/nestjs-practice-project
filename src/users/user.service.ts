import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import userErrors from './user.errors';
import { User } from './user.model';
import { AuthService } from '../auth/auth.service';
import { userConstants } from './user.constants';
import { PaginateModel, PaginateResult } from 'mongoose';
import { EmailDto } from './dtos/email.dto';
import { RandomService } from '../random/random.service';
import { ImagesService } from 'src/images/images.service';
import { Image } from 'src/images/image.model';

@Injectable()
export class UsersService {
  constructor(
    private readonly authService: AuthService,
    private readonly randomService: RandomService,
    @InjectModel('User') private readonly UserModel: PaginateModel<User>,
    private imagesService: ImagesService,
  ) {}

  moduleName = 'USERS';

  userIndexSelectFields = {
    id: true,
    email: true,
    createdAt: true,
    updatedAt: true,
    isAdmin: true,
    isBanned: true,
  };

  getRandomUser() {
    return this.randomService.getUser();
  }

  getRandomUsers(numberOfUsers?: string): User[] {
    let number = 100;
    if (numberOfUsers) {
      number = parseInt(numberOfUsers);
    }
    const users = [];
    for (let i = 1; i <= number; i++) {
      const user = this.randomService.getUser();
      user.id = `${i}`;
      users.push(user);
    }
    return users;
  }

  async findUserByEmail(email: string): Promise<User> {
    return this.UserModel.findOne({ email: email });
  }

  async findUserByEmailOrThrowForbidden(email: string): Promise<User> {
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new ForbiddenException();
    }
    return user;
  }

  async registerUser(user: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<EmailDto> {
    const foundUser = await this.findUserByEmail(user.email);
    if (foundUser) {
      throw new BadRequestException(userErrors.EMAIL_ALREADY_EXIST);
    }
    const newUser = new this.UserModel(user);
    newUser.nickname = await this.createNickName(user.email);
    const createdUser = await this.UserModel.create(newUser);
    return { email: createdUser.email };
  }

  async findUserByNickName(nickname: string): Promise<User> {
    return this.UserModel.findOne({ nickname: nickname });
  }

  async createNickName(email: string): Promise<any> {
    let counter = 0;
    let nickname = email.split('@')[0];
    if (!(await this.findUserByNickName(nickname))) {
      return nickname;
    }
    counter += 1;
    nickname = `${nickname}${counter}`;
    return this.createNickName(nickname);
  }

  async login(user: {
    email: string;
    password: string;
  }): Promise<{ isAdmin: boolean; email: string; jwt: string }> {
    const foundUser = await this.findUserByEmailOrThrowForbidden(user.email);
    if (foundUser.isBanned) {
      throw new ForbiddenException(userErrors.ALREADY_BANNED);
    }
    const valid = await foundUser.verifyPassword(user.password);
    if (!valid) {
      throw new ForbiddenException();
    }
    return this.authService.sendJWT(
      foundUser.id,
      foundUser.email,
      foundUser.isAdmin,
    );
  }

  async sendJwtToResetPassword(email): Promise<{ email: string; jwt: string }> {
    const user = await this.findUserByEmailOrThrowForbidden(email);
    user.password = null;
    await user.save();
    return this.authService.sendJWT(user.id, user.email, user.isAdmin);
  }

  async updatePassword(request, email): Promise<EmailDto> {
    const foundUser = await this.findUserByEmailOrThrowForbidden(email);
    if (foundUser.password) {
      throw new ForbiddenException(userErrors.ALREADY_HAVE_PASSWORD);
    }
    foundUser.password = request.password;
    await foundUser.save();
    return { email: foundUser.email };
  }

  async validateNickname(
    nickname: string,
    currentNickname: string,
  ): Promise<string> {
    if (!nickname) {
      return currentNickname;
    }
    if (
      (await this.findUserByNickName(nickname)) &&
      nickname !== currentNickname
    ) {
      throw new BadRequestException(userErrors.NICKNAME_ALREADY_EXIST);
    }
    return nickname;
  }

  async updateProfile(
    email: string,
    information: {
      nickname: string;
      firstName: string;
      lastName: string;
      cellphone: string;
      address: string;
    },
  ) {
    const user = await this.findUserByEmailOrThrowForbidden(email);
    information.nickname = await this.validateNickname(
      information.nickname,
      user.nickname,
    );
    Object.assign(user, information);
    await user.save();
    return {
      nickname: user.nickname,
      lastName: user.lastName,
      firstName: user.firstName,
      cellphone: user.cellphone,
      address: user.address,
    };
  }

  async uploadProfilePhoto(email: string, body: Image) {
    const user = await this.findUserByEmailOrThrowForbidden(email);
    const storedImage = await this.imagesService.saveImageProcess(
      body,
      this.moduleName,
    );
    user.profilePhotoId = storedImage._id;
    user.profilePhotoName = storedImage.name;
    user.profilePhotoType = storedImage.type;
    user.profilePhotoSize = storedImage.size;
    user.profilePhotoPath = storedImage.path;
    await user.save();
    return {
      email: user.email,
      nickname: user.nickname,
      isAdmin: user.isAdmin,
      lastName: user.lastName,
      firstName: user.firstName,
      cellphone: user.cellphone,
      address: user.address,
      profilePhotoId: user.profilePhotoId,
      profilePhotoName: user.profilePhotoName,
      profilePhotoType: user.profilePhotoType,
      profilePhotoSize: user.profilePhotoSize,
      profilePhotoPath: user.profilePhotoPath,
    };
  }

  async getUserProfile(email: string): Promise<{
    email: string;
    nickname: string;
    isAdmin: boolean;
    lastName: string;
    firstName: string;
    cellphone: string;
    address: string;
    profilePhotoId: string;
    profilePhotoName: string;
    profilePhotoType: string;
    profilePhotoSize: number;
    profilePhotoPath: string;
  }> {
    const user = await this.findUserByEmailOrThrowForbidden(email);
    return {
      email: user.email,
      nickname: user.nickname,
      isAdmin: user.isAdmin,
      lastName: user.lastName,
      firstName: user.firstName,
      cellphone: user.cellphone,
      address: user.address,
      profilePhotoId: user.profilePhotoId,
      profilePhotoName: user.profilePhotoName,
      profilePhotoType: user.profilePhotoType,
      profilePhotoSize: user.profilePhotoSize,
      profilePhotoPath: user.profilePhotoPath,
    };
  }

  async verifyIsAdmin(
    email: string,
    throwErrorIfIsNotAdmin: boolean,
  ): Promise<boolean> {
    const user = await this.findUserByEmailOrThrowForbidden(email);
    if (!user.isAdmin && throwErrorIfIsNotAdmin) {
      throw new ForbiddenException(userErrors.IS_NOT_ADMIN);
    }
    return user.isAdmin;
  }

  async getAllUsersToManage(email: string): Promise<User[]> {
    const throwErrorIfIsNotAdmin = false;
    if (await this.verifyIsAdmin(email, throwErrorIfIsNotAdmin)) {
      const users = await this.UserModel.find().select({
        password: false,
      });
      return users.filter((user) => user.email !== email);
    } else {
      return this.getRandomUsers();
    }
  }

  async getBannedUsersToManage(
    email: string,
    page: string,
  ): Promise<PaginateResult<User>> {
    await this.verifyIsAdmin(email, true);

    const query = {
      email: { $ne: email },
      isBanned: true,
    };

    const options = {
      select: this.userIndexSelectFields,
      sort: { createdAt: -1 },
      page: page ? parseInt(page) : 1,
      limit: userConstants.DEFAULT_LIMIT_PER_PAGE,
    };

    return this.UserModel.paginate(query, options);
  }

  async findUserByEmailToManage(adminEmail: string, userEmail: string) {
    await this.verifyIsAdmin(adminEmail, true);
    const userToBan = await this.findUserByEmail(userEmail);
    if (!userToBan) {
      throw new NotFoundException();
    }
    if (userToBan.isAdmin) {
      throw new ForbiddenException();
    }
    return userToBan;
  }

  async banUser(adminEmail: string, userEmail: string): Promise<EmailDto> {
    const userToBan = await this.findUserByEmailToManage(adminEmail, userEmail);
    if (userToBan.isBanned) {
      throw new ForbiddenException(userErrors.ALREADY_BANNED);
    }
    userToBan.isBanned = true;
    await userToBan.save();
    return { email: userToBan.email };
  }

  async removeBan(adminEmail: string, userEmail: string): Promise<EmailDto> {
    const userToBan = await this.findUserByEmailToManage(adminEmail, userEmail);
    if (!userToBan.isBanned) {
      throw new ForbiddenException(userErrors.IS_NOT_BANNED);
    }
    userToBan.isBanned = false;
    await userToBan.save();
    return { email: userToBan.email };
  }

  async deleteUser(adminEmail: string, userEmail: string): Promise<EmailDto> {
    const userToBan = await this.findUserByEmailToManage(adminEmail, userEmail);
    await this.UserModel.findByIdAndDelete(userToBan.id);
    return { email: userToBan.email };
  }
}
