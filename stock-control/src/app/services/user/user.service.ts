import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { SignUpUserRequest } from 'src/models/interfaces/users/SignUpUserRequest';
import { SignUpUserResponse } from 'src/models/interfaces/users/SignUpUserResponse';
import { AuthRequest } from 'src/models/interfaces/users/auth/AuthRequest';
import { AuthResponse } from 'src/models/interfaces/users/auth/AuthResponse';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private API_URL = environment.API_URL

  constructor(private http: HttpClient, private cookie:CookieService) {}

  signUpUser(input:SignUpUserRequest):Observable<SignUpUserResponse>{
    return this.http.post<SignUpUserResponse>(`${this.API_URL}/user`, input)
  }

  authUser(input:AuthRequest):Observable<AuthResponse>{
    return this.http.post<AuthResponse>(`${this.API_URL}/auth`, input)
  }

  isLoggedIn():boolean{
    const JWT_TOKEN = this.cookie.get("USER_INFO")
    return JWT_TOKEN ? true : false
  }
}
