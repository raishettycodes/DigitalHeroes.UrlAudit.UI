import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export type RegisterResponse = string;

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  resetToken?: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // private readonly apiBaseUrl = 'https://localhost:7225/api';
  private readonly apiBaseUrl = `${environment.apiUrl}/api`;
  private readonly tokenKey = 'token';

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(
        `${this.apiBaseUrl}/Auth/login`,
        request
      )
      .pipe(
        tap(response => {
          localStorage.setItem(this.tokenKey, response.token);
        })
      );
  }

  register(request: RegisterRequest): Observable<RegisterResponse> {
  return this.http.post<RegisterResponse>(
    `${this.apiBaseUrl}/Auth/register`,
    request,
    { responseType: 'text' as 'json' }
  );
}
forgotPassword(
  request: ForgotPasswordRequest
): Observable<ForgotPasswordResponse> {
  return this.http.post<ForgotPasswordResponse>(
    `${this.apiBaseUrl}/Auth/forgot-password`,
    request
  );
}

resetPassword(
  request: ResetPasswordRequest
): Observable<ResetPasswordResponse> {
  return this.http.post<ResetPasswordResponse>(
    `${this.apiBaseUrl}/Auth/reset-password`,
    request
  );
}

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}