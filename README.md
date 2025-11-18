# Digger TypeScript Policy Engine (PoC)

This repository is a Proof of Concept for writing Terraform Policies in pure TypeScript instead of using Rego (OPA).

## Why is this better than Rego?

While Open Policy Agent (Rego) is the industry standard, it introduces a high barrier to entry. Here is why a TypeScript approach fits the Digger philosophy of "using what you already have":

1.  **No New DSL to Learn:** Rego (Datalog) is declarative and can be unintuitive for developers used to imperative languages. TypeScript is standard for most engineering teams.
2.  **Real Debugging:** Instead of `trace()` and silent failures, you can use `console.log`, breakpoints, and standard Error stack traces.
3.  **Type Safety:** Terraform JSON output is deeply nested and complex. With TypeScript interfaces (provided in the SDK), you get **autocomplete** and compile-time errors if you access a field that doesn't exist.
4.  **External Data (The "Hermetic" Problem):** Rego is sandboxed. If you want to check if a tag matches a user in your DB or GitHub API, you have to pre-fetch that data. In TypeScript, you can just `await fetch()` or query your DB directly in the policy.
5.  **NPM Ecosystem:** Need to validate an IP address? `npm install ip`. Need complex schema validation? `npm install zod`. You don't have to reinvent the wheel.

## How it works

1. Digger runs `terraform plan -out=tfplan`.
2. Digger runs `terraform show -json tfplan > plan.json`.
3. Digger runs `npx ts-node policy/check.ts`.
4. The script parses the JSON, applies logic, and exits `0` (pass) or `1` (fail).

## Directory Structure

```text
.
├── digger.yml           # Digger configuration with custom workflow
├── package.json         # Dependencies (typescript, @types/node)
├── main.tf              # Sample Terraform with intentional policy violations
├── policy/
│   ├── check.ts         # YOUR policy logic (The User Code)
│   └── sdk.ts           # Helper types/functions (The "Digger SDK" mock)
└── ...
```

## Running it locally

### Prerequisites
- Node.js
- Terraform
- TypeScript (`npm install -g typescript ts-node`)

### Steps
1. Install dependencies:
   ```bash
   npm install
   ```

2. Initialize Terraform:
   ```bash
   terraform init
   ```
   *Note: The `main.tf` in this PoC uses mock AWS credentials so you can run it locally without an AWS account.*

3. Generate the Plan JSON:
   ```bash
   terraform plan -out=tfplan
   terraform show -json tfplan > plan.json
   ```

4. Run the Policy Check:
   ```bash
   npx ts-node policy/check.ts
   ```

   **Expected Output:**
   ```text
   ❌ Policy Violations Found:
    - EC2 Instance 'aws_instance.web_server' is missing required tag: 'Environment'
    - Security Group 'aws_security_group.allow_ssh' allows SSH from 0.0.0.0/0
   ```

5. Fix the `main.tf` to see it pass!
   - Add `Environment = "dev"` to tags.
   - Change CIDR to `"10.0.0.0/8"`.

## Reference Documentation

- [Terraform JSON Output Format](https://developer.hashicorp.com/terraform/internals/json-format) - The official schema we are parsing.
- [Digger Documentation](https://docs.digger.dev/) - How Digger works.
- [TypeScript Documentation](https://www.typescriptlang.org/docs/) - For writing advanced policies.

