import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Cliente } from 'src/app/Interfaces/cliente';
import { ClienteService } from 'src/app/Services/cliente.service';
import { UtilidadService } from 'src/app/Reutilizable/shared/utilidad.service';
import { ModalClienteComponent } from '../../Modales/modal-cliente/modal-cliente.component';
import { CookieService } from 'ngx-cookie-service';
import { ResponseAPI } from 'src/app/Interfaces/response-api';

import Swal from 'sweetalert2';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.css']
})
export class ClienteComponent implements OnInit, AfterViewInit {
  admin?:boolean;
  titulo= "";
  columnasTabla: string[] = [];
  dataInicio: Cliente[] = []; 
  dataListaClientes = new MatTableDataSource<Cliente>(this.dataInicio);
  @ViewChild(MatPaginator) paginacionTabla!: MatPaginator;


  constructor(
    private dialog: MatDialog,
    private cookie: CookieService,
    private _clienteServicio: ClienteService,
    private _utilidadServicio: UtilidadService
  ) { }

  obtenerClientes() {
    this._clienteServicio.lista().subscribe({
      next: (data) => {
        if (data.status) {
          this.dataListaClientes.data = data.value;
          this.dataListaClientes.paginator = this.paginacionTabla;
          //console.log(data.value)
        } else {
          this._utilidadServicio.mostrarAlerta("No se encontraron datos", "Revisar");
        }
      },
      error: (e) => {}
    });
  }


  obtenerClienteEspecifico(idPersona: number) {
    console.log('Iniciando búsqueda del cliente con idPersona:', idPersona);
  
    // Verifica si el idPersona es válido antes de continuar
    if (!idPersona) {
        console.warn('El idPersona es nulo o indefinido:', idPersona);
        return;
    }

    this._clienteServicio.buscar(idPersona).subscribe({
      next: (data: ResponseAPI) => {
        console.log('Respuesta recibida:', data);
        if (data.status) {
          console.log('Datos del cliente:', data.value);
          this.dataListaClientes.data = data.value as Cliente[]; // Asigna el array a la propiedad 'data'
          this.dataListaClientes.paginator = this.paginacionTabla;       
          console.log('Clientes asignados a la tabla:', this.dataListaClientes.data);
        } else {
          this._utilidadServicio.mostrarAlerta("No se encontraron datos", "Revisar");
          console.warn('No se encontraron datos para el cliente con idPersona:', idPersona);
        }
        this.titulo = "Progreso De Cliente ";
      },
      error: (e: any) => {
        console.error('Error al obtener cliente específico:', e);
        if (e.status === 404) {
          console.error('El endpoint no se encontró o el cliente no existe. Verifica la URL y el ID:', e.message);
        } else if (e.status === 500) {
          console.error('Error en el servidor al intentar obtener el cliente:', e.message);
        } else {
          console.error('Otro error ocurrió:', e.message);
        }
      }
    });
}

  ngOnInit(): void {

    let token: any = this.cookie.get('cookie');
    let token_idPersona: any = this.cookie.get('cookie_idPersona');
    
    if (token == 'Administrador') {
      this.obtenerClientes();
      this.columnasTabla.push( 'descripcionPersona', 'edad', 'peso', 'altura', 'masaMuscular', 'descripcionMembresia', 'fechaRegistro') 
      this.admin = true;
      this.titulo = "Registro de Clientes";
      console.log('Columnas para Administrador:', this.columnasTabla);
    }
    if (token == 'Cliente') {
      
      this.obtenerClienteEspecifico(token_idPersona); 
      this.columnasTabla.push( 'edad', 'peso', 'altura', 'masaMuscular', 'fechaRegistro') 
      console.log('Columnas para Clientes:', this.columnasTabla);
      console.log('Datos del cliente específico:', this.dataListaClientes);
    }

  }

  ngAfterViewInit(): void {
    this.dataListaClientes.paginator = this.paginacionTabla;
  }

 
  aplicarFiltroTabla(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataListaClientes.filter = filterValue.trim().toLowerCase();
    // Handle empty filter case
    if (this.dataListaClientes.paginator) {
      this.dataListaClientes.paginator.firstPage();
    }
  }

  nuevoCliente() {
    this.dialog.open(ModalClienteComponent, {
      disableClose: true
    }).afterClosed().subscribe(resultado => {
      if (resultado === "true") this.obtenerClientes();
    });
  }

}

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';


