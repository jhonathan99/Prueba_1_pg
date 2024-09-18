import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Pago } from 'src/app/Interfaces/pago';
import { PagoService } from 'src/app/Services/pago.service';
import { UtilidadService } from 'src/app/Reutilizable/shared/utilidad.service';
import { CookieService } from 'ngx-cookie-service';
import { ResponseAPI } from 'src/app/Interfaces/response-api';
import Swal from 'sweetalert2'; // Importar Swal
import { ModalPagosComponent } from '../../Modales/modal-pagos/modal-pagos.component';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-reporte-pago',
  templateUrl: './reporte-pago.component.html',
  styleUrls: ['./reporte-pago.component.css']
})
export class ReportePagoComponent implements OnInit, AfterViewInit {
  admin?: boolean;
  titulo = "";
  columnasTabla: string[] = [];
  dataInicio: Pago[] = []; 
  dataListaPago = new MatTableDataSource<Pago>(this.dataInicio);
  @ViewChild(MatPaginator) paginacionTabla!: MatPaginator;

  constructor(
    private dialog: MatDialog,
    private cookie: CookieService,
    private _pagoservicio: PagoService,
    private _utilidadServicio: UtilidadService
  ) { }

  obtenerPagos() {
    this._pagoservicio.lista().subscribe({
      next: (data) => {
        if (data.status) {
          this.dataListaPago.data = data.value;
          this.dataListaPago.paginator = this.paginacionTabla;
        } else {
          this._utilidadServicio.mostrarAlerta("No se encontraron datos", "Revisar");
        }
      },
      error: (e) => {
        console.error('Error al obtener pagos:', e);
      }
    });
  }

  obtenerClienteEspecifico(idPersona: number) {
    console.log('Iniciando búsqueda del cliente con idPersona:', idPersona);
  
    if (!idPersona) {
        console.warn('El idPersona es nulo o indefinido:', idPersona);
        return;
    }

    this._pagoservicio.buscar(idPersona).subscribe({
      next: (data: ResponseAPI) => {
        if (data.status) {
          this.dataListaPago.data = data.value as Pago[];
          this.dataListaPago.paginator = this.paginacionTabla;       
        } else {
          this._utilidadServicio.mostrarAlerta("No se encontraron datos", "Revisar");
          console.warn('No se encontraron datos para el cliente con idPersona:', idPersona);
        }
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
    
    if (token === 'Administrador') {
      this.obtenerPagos();
      this.columnasTabla.push('descripcionPersona', 'descripcionDireccion', 'descripcionNit', 'descripcionTipoPago', 'fechaInicio', 'fechaFin', 'mes', 'monto', 'fechaRegistro','acciones');
      this.admin = true;
      this.titulo = "Reporte de Pagos";
      console.log('Columnas para Administrador:', this.columnasTabla);
    } else if (token === 'Cliente') {
      this.obtenerClienteEspecifico(token_idPersona); 
      this.columnasTabla.push('descripcionDireccion', 'descripcionNit', 'descripcionTipoPago', 'fechaInicio', 'fechaFin', 'mes', 'monto');
      this.titulo = "Reporte de Pagos Cliente";
      console.log('Columnas para Clientes:', this.columnasTabla);
      console.log('Datos del cliente específico:', this.dataListaPago);
    }
  }
  
  ngAfterViewInit(): void {
    this.dataListaPago.paginator = this.paginacionTabla;
  }

  exportToExcel(): void {
    try {
      const filteredData = this.dataListaPago.filteredData;
      if (filteredData.length === 0) {
        this._utilidadServicio.mostrarAlerta("No hay datos para exportar", "Advertencia");
        return;
      }
  
      const exportData = filteredData.map(Pago => ({
        Cliente: Pago.descripcionPersona || 'N/A',
        Dirección: Pago.descripcionDireccion || 'N/A',
        NIT: Pago.descripcionNit || 'N/A',
        Tipo_de_Pago: Pago.descripcionTipoPago || 'N/A',
        Fecha_Inicio: Pago.fechaInicio ? new Date(Pago.fechaInicio).toLocaleDateString() : 'N/A',
        Fecha_Fin: Pago.fechaFin ? new Date(Pago.fechaFin).toLocaleDateString() : 'N/A',
        Mes: Pago.mes || 'N/A',
        Monto: Pago.monto || 0,
      }));
  
      const totalCosto = this.getTotalCosto();
      exportData.push({
        Cliente: 'Total',
        Dirección: '',
        NIT: '',
        Tipo_de_Pago: '',
        Fecha_Inicio: '',
        Fecha_Fin: '',
        Mes: '',
        Monto: totalCosto
      });
  
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Pagos');
  
      const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, 'reporte_pagos');
    } catch (error) {
      console.error("Error durante la exportación a Excel: ", error);
      this._utilidadServicio.mostrarAlerta("Error durante la exportación a Excel", "Error");
    }
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }

  aplicarFiltroTabla(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataListaPago.filter = filterValue.trim().toLowerCase();
    if (this.dataListaPago.paginator) {
      this.dataListaPago.paginator.firstPage();
    }
  }

  getTotalCosto(): number {
    return this.dataListaPago.filteredData
      .reduce((acc, curr) => acc + (Number(curr.monto) || 0), 0);
  }

  editarPago(pago: Pago) {
    console.log('Datos de pago enviados al modal:', pago); // Asegúrate de que `pago.idpago` esté presente
    
    const dialogRef = this.dialog.open(ModalPagosComponent, {
      width: '500px',
      data: pago
    });
  
    dialogRef.afterClosed().subscribe(result => {
      console.log('El resultado del modal es:', result);
    });
  }
  
  
}

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
