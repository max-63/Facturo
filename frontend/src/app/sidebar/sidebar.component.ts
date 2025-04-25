import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service'; // Assurez-vous que ApiService existe et contient les méthodes getClients et getFactures
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';



@Component({
  selector: 'app-sidebar',
  standalone: true, //importnat
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  imports: [CommonModule, RouterModule]
})
export class SidebarComponent implements OnInit {
  ngOnInit() : void {

  }
  
}
