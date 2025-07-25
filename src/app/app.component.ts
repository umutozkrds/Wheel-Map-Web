import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'wheelmap';

  onSectionChanged(section: string): void {
    console.log('Section changed to:', section);
    // Handle section navigation here
  }

  onSearchPerformed(searchTerm: string): void {
    console.log('Search performed:', searchTerm);
    // Handle search functionality here
  }

  onLanguageChanged(language: string): void {
    console.log('Language changed to:', language);
    // Handle language switching here
  }

  onAccessibilityFilterChanged(filter: string): void {
    console.log('Accessibility filter changed to:', filter);
    // Handle accessibility filtering here
  }

  onActionTriggered(action: string): void {
    console.log('Action triggered:', action);
    // Handle various navbar actions here
    switch (action) {
      case 'contribute':
        // Show add place functionality
        break;
      case 'report':
        // Show report issue form
        break;
      case 'help':
        // Show help/tutorial
        break;
      case 'settings':
        // Show settings panel
        break;
    }
  }
}
