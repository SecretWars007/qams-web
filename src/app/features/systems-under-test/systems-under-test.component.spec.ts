import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemsUnderTestComponent } from './systems-under-test.component';

describe('SystemsUnderTestComponent', () => {
  let component: SystemsUnderTestComponent;
  let fixture: ComponentFixture<SystemsUnderTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemsUnderTestComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemsUnderTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
