/* eslint-disable prettier/prettier */
export class AuthResponse {
    constructor(private email: string, private accessToken: string, private tokenType = 'Bearer') { }
  }
  