import { TestBed } from '@angular/core/testing';

import { Http2Service } from './http2.service';

describe('Http2Service', () => {
  let service: Http2Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Http2Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
