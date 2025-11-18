import * as fs from 'fs';

// --- Minimal Terraform JSON Types ---
export interface TFPlan {
  format_version: string;
  resource_changes: ResourceChange[];
}

export interface ResourceChange {
  address: string;
  type: string;
  name: string;
  change: {
    actions: ('create' | 'read' | 'update' | 'delete' | 'no-op')[];
    before: Record<string, any> | null;
    after: Record<string, any> | null;
    after_unknown: Record<string, any> | null;
  };
}

// --- The Runner ---
export class PolicyEngine {
  private violations: string[] = [];
  private plan: TFPlan;

  constructor(planPath: string) {
    try {
        const raw = fs.readFileSync(planPath, 'utf-8');
        this.plan = JSON.parse(raw);
    } catch (e) {
        console.error("Failed to read plan.json. Make sure you run 'terraform show -json tfplan > plan.json' first.");
        process.exit(1);
    }
  }

  /**
   * Select resources by type (e.g., 'aws_instance')
   */
  select(resourceType: string): ResourceChange[] {
    if (!this.plan.resource_changes) return [];
    
    return this.plan.resource_changes.filter(
      (r) => r.type === resourceType && 
      (r.change.actions.includes('create') || r.change.actions.includes('update'))
    );
  }

  /**
   * Report a violation
   */
  fail(message: string) {
    this.violations.push(message);
  }

  /**
   * Evaluate and exit process
   */
  evaluate() {
    if (this.violations.length > 0) {
      console.error('\x1b[31m%s\x1b[0m', '❌ Policy Violations Found:');
      this.violations.forEach((v) => console.error(` - ${v}`));
      process.exit(1);
    } else {
      console.log('\x1b[32m%s\x1b[0m', '✅ All Policies Passed');
      process.exit(0);
    }
  }
}
