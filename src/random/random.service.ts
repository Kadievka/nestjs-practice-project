import { Injectable } from '@nestjs/common';
import { colors } from './data/colors';
import { firstNames } from './data/firstNames';
import { lastNames } from './data/lastNames';
import { mails } from './data/mails';
import { words } from './data/words';

@Injectable()
export class RandomService {
  private randomNumber(order = 1): number {
    return Math.floor(Math.random() * order);
  }

  private selectIndex(array: string[]) {
    return this.randomNumber(array.length);
  }

  getOne = () => ({
    color: () => colors[this.selectIndex(colors)],
    firstName: () => firstNames[this.selectIndex(firstNames)],
    lastName: () => lastNames[this.selectIndex(lastNames)],
    mail: () => mails[this.selectIndex(mails)],
    word: () => words[this.selectIndex(words)],
  });

  getEmail = () =>
    `${this.getOne()
      .firstName()
      .toLowerCase()}_${this.getOne().word()}${this.randomNumber(
      1000,
    )}${this.getOne().mail()}`;

  getPassword = () =>
    `${this.randomNumber(
      100000000,
    )}.${this.getOne().color()}!${this.randomNumber(1000)}`;

  public getUser = () => ({
    id: '',
    firstName: this.getOne().firstName(),
    lastName: this.getOne().lastName(),
    email: this.getEmail(),
    password: this.getPassword(),
  });
}
