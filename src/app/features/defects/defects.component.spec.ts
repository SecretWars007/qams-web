import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefectsComponent } from './defects.component';

describe('DefectsComponent', () => {
  let component: DefectsComponent;
  let fixture: ComponentFixture<DefectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefectsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DefectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
