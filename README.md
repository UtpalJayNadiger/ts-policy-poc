# Digger TypeScript Policy Engine (PoC)

This repository is a Proof of Concept for writing Terraform Policies in pure TypeScript instead of using Rego (OPA).

## Why?
- **Type Safety:** You get autocomplete on your Terraform Plan resources (if you expand the SDK types).
- **Ecosystem:** You can use any NPM package (Lodash, Zod, Axios) in your policies.
- **Debugging:** Use standard `console.log` or attach a debugger.

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

