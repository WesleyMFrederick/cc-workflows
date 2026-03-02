```xml
<specification>
  <name>{{change-name}}</name>
  <overview>...</overview>
  <artifacts>
    <target>...</target>
    <context>
      <file role="baseline_trace">../baseline.md</file>
      <file role="ideal_trace">../ideal.md</file>
      <file role="delta">../delta.md</file>
    </context>
  </artifacts>
  <interface_boundaries>
    <boundary id="B1" type="" location="">
      <name/> <in/> <out/> <constraints/>
    </boundary>
  </interface_boundaries>
  <test_contract>
    <fixtures>...</fixtures>
    <assertions>...</assertions>
    <negative_assertions>...</negative_assertions>
  </test_contract>
  <!-- Scale tasks to match scope:
       Patch: 1 dev task + 1 review task
       Feature: N dev tasks + N review tasks -->
  <task id="1" name="" agent="dev_agent">
    <step number="1" phase="RED">...</step>
    <step number="2" phase="GREEN">...</step>
    <step number="3" phase="COMMIT">...</step>
  </task>
  <task id="2" name="" agent="reviewer" blocked_by="1">
    <checklist>...</checklist>
    <verdict>APPROVED | FIX_REQUIRED</verdict>
  </task>
  <success_criteria>
    <pass>...</pass>
    <fail>...</fail>
  </success_criteria>
</specification>
```
