import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestPlanModalComponent } from './test-plan-modal.component';

describe('TestPlanModalComponent', () => {
  let component: TestPlanModalComponent;
  let fixture: ComponentFixture<TestPlanModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestPlanModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestPlanModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
