import { Component, OnInit } from '@angular/core';
import { Chart,registerables } from 'chart.js';
import { ReporteService } from 'src/app/Services/reporte.service';
Chart.register(...registerables);

@Component({
  selector: 'app-dash-board',
  templateUrl: './dash-board.component.html',
  styleUrls: ['./dash-board.component.css']
})
export class DashBoardComponent implements OnInit {

  totalUsuarios:string="0";
  totalClientes:string ="0";

  constructor(
    private _reporteServicio: ReporteService
  ) { }

  
  mostrarGrafico(labelGrafico:any[],dataUsuarios:any[],dataClientes:any[]){
    const chartBarras = new Chart('chartBarras',{
      type:'bar',
      data: {
        labels:labelGrafico,
          datasets: [
            {
              label: "Usuarios en General",
              data: dataUsuarios,
              backgroundColor: 'rgba(194, 243, 238, 0.4)',
              borderColor: 'rgba(15, 33, 32, 1)',
              borderWidth: 1
            },
            {
              label: "Usuarios Registrados: Clientes",
              data: dataClientes,
              backgroundColor: 'rgba(255, 99, 132, 0.4)', // Color diferente para distinguir
              borderColor: 'rgba(255, 99, 132, 1)', // Color diferente para distinguir
              borderWidth: 1
            }
          ]
            
      },
      options:{
        maintainAspectRatio:false,
        responsive:true,
        scales:{
          y:{
            beginAtZero:true
          }
        }
      }
    });
  }

  ngOnInit(): void {
    this._reporteServicio.reporte().subscribe({
      next:(data) =>{
        if(data.status){
          this.totalUsuarios = data.value.totalUsuarios;
          this.totalClientes = data.value.totalClientes;
            // Asume que los datos para el gráfico vienen en data.value
            const labels = ['Usuarios']; // Etiquetas del gráfico

            const dataUsuarios = [this.totalUsuarios]; // Datos para usuarios
            const dataClientes = [this.totalClientes]; // Datos para clientes
  
            this.mostrarGrafico(labels, dataUsuarios, dataClientes);
            
        }

      },
      error:(e) =>{}
    })
  }

}
