import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemUnderTestModalComponent } from './system-under-test-modal.component';

describe('SystemUnderTestModalComponent', () => {
  let component: SystemUnderTestModalComponent;
  let fixture: ComponentFixture<SystemUnderTestModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemUnderTestModalComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemUnderTestModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
