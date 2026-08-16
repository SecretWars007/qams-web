import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestPlanDetailComponent } from './test-plan-detail.component';

describe('TestPlanDetailComponent', () => {
  let component: TestPlanDetailComponent;
  let fixture: ComponentFixture<TestPlanDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestPlanDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestPlanDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
