/* eslint-disable prettier/prettier */
import { User } from 'src/user/user.entity';

export const findUserSelectors: (keyof User)[] = [
  'id',
  'firstName',
  'lastName',
  'email',
];

export const getUserSelectors = (selectPassword?: boolean): (keyof User)[] => 
    selectPassword ? [...findUserSelectors, 'password'] : findUserSelectors;
