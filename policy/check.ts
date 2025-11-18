import { PolicyEngine } from './sdk';

const engine = new PolicyEngine('plan.json');

// --- Policy 1: Enforce Tagging on EC2 ---
const instances = engine.select('aws_instance');

for (const instance of instances) {
  const tags = instance.change.after?.tags || {};
  
  if (!tags['Environment']) {
    engine.fail(`EC2 Instance '${instance.address}' is missing required tag: 'Environment'`);
  }
  
  if (tags['Environment'] === 'production' && instance.change.after?.instance_type === 't2.micro') {
    engine.fail(`Production instances cannot be t2.micro (found in ${instance.address})`);
  }
}

// --- Policy 2: Security Groups shouldn't be open to world ---
const sgs = engine.select('aws_security_group');

for (const sg of sgs) {
  const ingress = sg.change.after?.ingress || [];
  for (const rule of ingress) {
    // In Terraform JSON, set/list attributes can sometimes be nested, 
    // but for ingress blocks defined inline, they appear as a list of objects.
    // Note: if using ingress rules as separate resources, we'd need to query 'aws_security_group_rule' instead.
    
    if (rule.cidr_blocks?.includes('0.0.0.0/0') && rule.from_port === 22) {
       engine.fail(`Security Group '${sg.address}' allows SSH from 0.0.0.0/0`);
    }
  }
}

// Finalize
engine.evaluate();
