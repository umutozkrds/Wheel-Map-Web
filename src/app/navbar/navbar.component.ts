import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  activeSection: string = 'map';
  // Event emitters to communicate with parent components
  @Output() sectionChanged = new EventEmitter<string>();
  @Output() actionTriggered = new EventEmitter<string>();

  constructor() { }

  setActiveSection(section: string): void {
    this.activeSection = section;
    this.sectionChanged.emit(section);
  }






  contributePlace(): void {
    this.actionTriggered.emit('contribute');
  }

  reportIssue(): void {
    this.actionTriggered.emit('report');
  }

  showHelp(): void {
    this.actionTriggered.emit('help');
  }

  showSettings(): void {
    this.actionTriggered.emit('settings');
  }
}
