Q1: Thought Process
I built the project in four steps. First, I made sure every requirement had a corresponding piece of code so nothing was missing. Second, I added features needed for a real API, like authentication, error handling, request logging, and a health check. Third, I made the app configurable using environment variables, so settings can be changed without touching the code. Finally, I wrote tests to cover normal use cases and edge cases, like weekend schedules. I also organized the code using NestJS modules, which keeps it clean, easy to understand, and simple to extend in the future.


Q2: Key Assumptions

a. The total of all portfolio weights must be 100 — this is checked when the order is created.

b. “Next market open” means the next weekday at 9:30 AM EST (14:30 UTC). If the current time is after market close (21:00 UTC), the order is scheduled for the following business day.

c. Fractional shares are allowed — the quantity is rounded to the set number of decimal places.

d. Using an in-memory store is intentional. A Map inside a NestJS singleton works safely because Node is single-threaded.

e. The fixed $100 price is just for the demo. In a real system, this would come from live market data.


Q3: Challenges

a. Market scheduling handles tricky cases like weekends and weekday after-market-close times, making sure days aren’t accidentally skipped.

b. Float precision is managed carefully using toFixed() after allocation but before division, so rounding errors don’t add up.

c. The portfolio weight sum check needed a custom validator because NestJS built-in validators only work on individual fields, not the total.


Q4 Production Migration Checklist

a. Auth: Rotate API keys and add scopes (read-only vs write) to follow the principle of least privilege.

b. Database: Use PostgreSQL with TypeORM migrations to store orders safely and support queries with ACID guarantees.

c. Price Feed: Replace the fixed $100 price with real market data from APIs like Polygon.io or Alpaca.

d. Async Execution: Send orders to a message queue (RabbitMQ or SQS) to ensure reliable execution and retries on failure.

e. Observability: Use structured JSON logs with Winston and Prometheus metrics for alerting, dashboards, and SLA monitoring.

f. CI/CD: Set up GitHub Actions to run linting, tests, and coverage checks before deployment to prevent broken code from reaching production.

g. Secrets: Store sensitive keys (like API_KEY) in AWS Secrets Manager or Vault instead of in code or environment variables.

h. HTTPS: Terminate TLS at the load balancer (AWS ALB) to ensure secure communication.

i. Input Sanitisation: Validate ticker symbols using regex to prevent injection or malicious inputs.


Q5 LLM Usage

I first manually created the service and controller skeletons and added the business logic. I then used an LLM to verify my implementation, check tricky edge cases in the weekend scheduling algorithm, suggest a custom class-validator decorator to ensure portfolio weights sum to 100, help with writing test cases, and review my initial solution to spot gaps and make it production-ready, in document creation.



