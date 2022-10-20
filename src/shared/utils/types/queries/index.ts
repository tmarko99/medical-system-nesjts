/* eslint-disable prettier/prettier */
export type FindUserParams = Partial<{
  id: number;
  email: string;
}>;

export type FindUserOptions = {
  selectPassword?: boolean;
};
