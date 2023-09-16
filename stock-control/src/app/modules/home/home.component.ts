import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { UserService } from 'src/app/services/user.service';
import { SignUpUserRequest } from 'src/models/interfaces/users/SignUpUserRequest';
import { AuthRequest } from 'src/models/interfaces/users/auth/AuthRequest';
import { AuthResponse } from 'src/models/interfaces/users/auth/AuthResponse';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  loginCard = true;
  loginForm = this.formBuilder.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  signUpForm = this.formBuilder.group({
    name: ['', Validators.required],
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  constructor(
    private formBuilder: FormBuilder, 
    private userService:UserService,
    private cookieService:CookieService,
    private messageService:MessageService
    ) {}

  onSubmitLoginForm(): void {
    if(this.loginForm.value && this.loginForm.valid){
      this.userService.authUser(this.loginForm.value as AuthRequest)
      .subscribe({
        next: (response:AuthResponse)=>{
          if(response){
            this.cookieService.set("USER_INFO", response?.token)
            this.loginForm.reset()
            this.messageService.add({severity:'success', summary:'Sucesso', detail:`Bem-vindo de volta! ${response?.name}`, life: 2000})
          }
        },
        error:(error)=>{
          this.messageService.add({severity:'error', summary:'Erro', detail:'Erro ao realizar login', life: 2000})
        }
      })
    }
  }

  onSubmitSignUpForm(): void {
    if(this.signUpForm.value && this.signUpForm.valid){
      this.userService.signUpUser(this.signUpForm.value as SignUpUserRequest)
      .subscribe({
        next: (response) => {
          if(response){
            this.signUpForm.reset()
            this.loginCard = true
            this.messageService.add({severity:'success', summary:'Sucesso', detail:'Usuário cadastrado com sucesso!', life: 2000})
          }
        },
        error: ({error}) => {
          this.messageService.add({severity:'error', summary:'Erro', detail:`Erro ao cadastrar usuário ${JSON.stringify(error?.error)}`, life: 2000})
        }
      })
    }
  }
}
