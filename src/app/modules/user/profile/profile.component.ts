import { SharedModule } from '@/app/shared/modules/shared.module';
import { Component, inject } from '@angular/core';
import { LabelComponent } from "../../../shared/components/label/label.component";
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component";
import { UsersService } from '@/app/shared/services/users.service';


interface UserProfile {
  username: string;
  password: string;
  email: string;
  profile: {
    profilePicture: string;
    description: string;
    gender: string;
  };
}
@Component({
  selector: 'app-profile',
  imports: [SharedModule, NavbarComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  user: UserProfile;
  editMode = false;
  usersService: UsersService = inject(UsersService)

  ngOnInit(): void {
    this.user = {
      username: 'usuario_exemplo',
      password: '********',
      email: 'usuario@exemplo.com',
      profile: {
        profilePicture: 'assets/default-profile.jpg',
        description: 'Esta é uma descrição de perfil de exemplo. O usuário pode editar isso para adicionar informações sobre si mesmo.',
        gender: 'Não especificado'
      }
    };
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
  }

  saveProfile(): void {
    // Aqui você enviaria os dados atualizados para o backend
    this.editMode = false;
    // Exibir mensagem de sucesso usando PrimeNG Toast
  }
}
