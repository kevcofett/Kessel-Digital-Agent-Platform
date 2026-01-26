# MANUAL FLOW VALIDATION - QUICK CHECKLIST

Open Power Automate: https://make.powerautomate.com (Aragorn AI environment)

---

## CRITICAL PATTERNS TO CHECK

**❌ BAD → ✅ GOOD:**
- `mpa_benchmarks` → `mpa_benchmark`
- `mpa_isactive` → `mpa_isactive`  
- `mpa_vertical` (in filter) → `mpa_verticalcode`
- `org5c737821.crm.dynamics.com` → `aragornai.crm.dynamics.com`
- `localhost:7071` → `func-aragorn-mpa.azurewebsites.net`

---

## FLOWS TO CHECK (11 total)

### 1. MPA_SearchBenchmarks ⚠️ CRITICAL
- [ ] Table: `mpa_benchmark` (singular)
- [ ] Filter column: `mpa_isactive`
- [ ] Filter column: `mpa_verticalcode`
- [ ] Filter column: `mpa_channelcode`

### 2-4. MPA_Search[Channels|KPIs|Verticals]
- [ ] All use singular table names
- [ ] All use `mpa_isactive` column

### 5. MPA_ValidatePlan ⚠️ CRITICAL
- [ ] Azure Function: `https://func-aragorn-mpa.azurewebsites.net/api/ValidateMediaPlan`
- [ ] Has function key

### 6. MPA_GenerateDocument ⚠️ CRITICAL
- [ ] Azure Function: `.../api/GenerateDocument`
- [ ] Has function key

### 7-11. Remaining Flows
- [ ] All Dataverse tables singular
- [ ] All columns match schema

---

## SUMMARY

Issues found: ___
Status: ✅ Clean / ⚠️ Minor / ❌ Blocking
