import http from 'k6/http';
import { check, sleep } from 'k6';

const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  vus: 5,
  duration: '20s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  const responses = [
    http.get(`${baseUrl}/`),
    http.get(`${baseUrl}/api/v1/health`),
  ];

  responses.forEach((response) => {
    check(response, {
      'status is 2xx/3xx': (r) => r.status >= 200 && r.status < 400,
    });
  });

  sleep(1);
}
