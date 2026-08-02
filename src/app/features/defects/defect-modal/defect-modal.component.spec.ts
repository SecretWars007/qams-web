import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefectModalComponent } from './defect-modal.component';

describe('DefectModalComponent', () => {
  let component: DefectModalComponent;
  let fixture: ComponentFixture<DefectModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefectModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DefectModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
