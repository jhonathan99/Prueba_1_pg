import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { Menu } from 'src/app/Interfaces/menu';

import { MenuService } from 'src/app/Services/menu.service';
import { UtilidadService } from 'src/app/Reutilizable/shared/utilidad.service';
import { AuthService } from 'src/app/Services/authService.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {

  listaMenus:Menu[] = [];
  correoUsuario:string = '';
  rolUsuario:string = '';

  constructor(
    private router:Router,
    private _menuServicio : MenuService,
    private _utilidadServicio: UtilidadService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {

    const usuario = this._utilidadServicio.obtenerSesionUsuario();
    if(usuario != null){
      this.correoUsuario = usuario.correo;
      this.rolUsuario = usuario.rolDescripcion;
      this._menuServicio.lista(usuario.idUsuario).subscribe({
        next: (data) =>{
          if(data.status) this.listaMenus = data.value;
        },
        error:(e)=>{}
      })
    }
  }

  cerrarSesion(){
    this._utilidadServicio.eliminarSesionUsuario();
    this.router.navigate(['login']);
    this.authService.logout();
    this.router.navigate(['/login']); // Redirige al login después del logout
  }
  

}
